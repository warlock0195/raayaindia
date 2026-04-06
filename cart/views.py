from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from core.marketing import upsert_abandoned_cart_snapshot
from products.models import Product, ProductVariant

from .models import Cart, CartItem
from .serializers import CartItemSerializer, CartSerializer


class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return Cart.objects.prefetch_related("items__product", "items__variant").get(pk=cart.pk)


class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "user"

    @transaction.atomic
    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get("product")
        if not product_id:
            raise ValidationError({"product": "This field is required."})

        product = get_object_or_404(
            Product.objects.select_for_update().filter(is_active=True), id=product_id
        )
        variant_id = request.data.get("variant")
        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            raise ValidationError({"quantity": "Quantity must be a valid integer."})

        if quantity <= 0:
            return Response({"detail": "Quantity must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

        variant = None
        available_stock = product.stock_quantity
        if variant_id:
            variant = get_object_or_404(ProductVariant.objects.select_for_update(), id=variant_id, product=product)
            available_stock = variant.variant_stock

        if quantity > available_stock:
            return Response({"detail": "Insufficient stock."}, status=status.HTTP_400_BAD_REQUEST)

        cart_item = (
            CartItem.objects.select_for_update()
            .filter(cart=cart, product=product, variant=variant)
            .first()
        )

        if not cart_item:
            cart_item = CartItem.objects.create(
                cart=cart,
                product=product,
                variant=variant,
                quantity=quantity,
                unit_price=product.effective_price,
            )
            upsert_abandoned_cart_snapshot(request.user, cart)
            return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)

        new_quantity = cart_item.quantity + quantity
        if new_quantity > available_stock:
            return Response({"detail": "Insufficient stock."}, status=status.HTTP_400_BAD_REQUEST)
        cart_item.quantity = new_quantity
        cart_item.unit_price = product.effective_price
        cart_item.save(update_fields=["quantity", "unit_price"])
        upsert_abandoned_cart_snapshot(request.user, cart)

        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_200_OK)


class UpdateCartItemView(generics.UpdateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "user"

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user).select_related("product", "variant")

    def update(self, request, *args, **kwargs):
        cart_item = self.get_object()
        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            raise ValidationError({"quantity": "Quantity must be a valid integer."})
        if quantity <= 0:
            return Response({"detail": "Quantity must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

        available_stock = cart_item.variant.variant_stock if cart_item.variant else cart_item.product.stock_quantity
        if quantity > available_stock:
            return Response({"detail": "Insufficient stock."}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.unit_price = cart_item.product.effective_price
        cart_item.save(update_fields=["quantity", "unit_price"])
        upsert_abandoned_cart_snapshot(request.user, cart_item.cart)
        return Response(CartItemSerializer(cart_item).data)


class RemoveCartItemView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "user"

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        cart = instance.cart
        instance.delete()
        upsert_abandoned_cart_snapshot(request.user, cart)
        return Response(status=status.HTTP_204_NO_CONTENT)
