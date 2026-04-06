from django.db import transaction
from rest_framework import serializers

from cart.models import CartItem
from core.marketing import mark_abandoned_cart_converted
from payments.models import PaymentTransaction
from products.models import Product, ProductVariant
from users.models import Address

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "variant", "quantity", "unit_price", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    tracking_timeline = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "total_amount",
            "shipping_address",
            "payment_method",
            "payment_status",
            "status",
            "created_at",
            "updated_at",
            "items",
            "tracking_timeline",
        ]

    def get_tracking_timeline(self, obj):
        sequence = [
            Order.Status.PENDING,
            Order.Status.CONFIRMED,
            Order.Status.SHIPPED,
            Order.Status.DELIVERED,
        ]
        current_index = sequence.index(obj.status) if obj.status in sequence else -1
        return [
            {
                "status": status,
                "completed": idx <= current_index,
            }
            for idx, status in enumerate(sequence)
        ]


class CheckoutSerializer(serializers.Serializer):
    shipping_address_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.COD)

    def validate_shipping_address_id(self, value):
        user = self.context["request"].user
        if not Address.objects.filter(id=value, user=user).exists():
            raise serializers.ValidationError("Invalid shipping address.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        cart = getattr(user, "cart", None)
        if not cart:
            raise serializers.ValidationError({"detail": "Cart not found."})

        cart_items = (
            CartItem.objects.select_for_update()
            .select_related("product", "variant")
            .filter(cart=cart)
        )

        if not cart_items.exists():
            raise serializers.ValidationError({"detail": "Cart is empty."})

        product_ids = [item.product_id for item in cart_items]
        variant_ids = [item.variant_id for item in cart_items if item.variant_id]

        locked_products = {
            p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
        }
        locked_variants = {
            v.id: v for v in ProductVariant.objects.select_for_update().filter(id__in=variant_ids)
        }

        total = 0
        order_items = []

        for item in cart_items:
            locked_product = locked_products[item.product_id]
            locked_variant = locked_variants.get(item.variant_id) if item.variant_id else None

            stock = locked_variant.variant_stock if locked_variant else locked_product.stock_quantity
            if item.quantity > stock:
                raise serializers.ValidationError(
                    {"detail": f"Insufficient stock for {locked_product.name}."}
                )

            unit_price = locked_product.effective_price
            total += unit_price * item.quantity
            order_items.append(
                OrderItem(
                    product=locked_product,
                    variant=locked_variant,
                    quantity=item.quantity,
                    unit_price=unit_price,
                )
            )

        order = Order.objects.create(
            user=user,
            shipping_address_id=validated_data["shipping_address_id"],
            total_amount=total,
            payment_method=validated_data["payment_method"],
            payment_status=(
                Order.PaymentStatus.SUCCESS
                if validated_data["payment_method"] == Order.PaymentMethod.COD
                else Order.PaymentStatus.PENDING
            ),
            status=(
                Order.Status.CONFIRMED
                if validated_data["payment_method"] == Order.PaymentMethod.COD
                else Order.Status.PENDING
            ),
        )

        for item in order_items:
            item.order = order

        OrderItem.objects.bulk_create(order_items)

        for cart_item in cart_items:
            if cart_item.variant_id:
                variant = locked_variants[cart_item.variant_id]
                variant.variant_stock -= cart_item.quantity
                variant.save(update_fields=["variant_stock"])
            else:
                product = locked_products[cart_item.product_id]
                product.stock_quantity -= cart_item.quantity
                product.save(update_fields=["stock_quantity"])

        if order.payment_method == Order.PaymentMethod.ONLINE:
            PaymentTransaction.objects.create(
                order=order,
                provider="razorpay",
                status=PaymentTransaction.Status.INITIATED,
                amount=order.total_amount,
            )

        cart_items.delete()
        mark_abandoned_cart_converted(user)
        return order


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)

    def validate_status(self, value):
        order = self.context["order"]
        allowed_transitions = {
            Order.Status.PENDING: {Order.Status.CONFIRMED, Order.Status.CANCELLED},
            Order.Status.CONFIRMED: {Order.Status.SHIPPED, Order.Status.CANCELLED},
            Order.Status.SHIPPED: {Order.Status.DELIVERED},
            Order.Status.DELIVERED: set(),
            Order.Status.CANCELLED: set(),
        }

        if value == order.status:
            return value

        if value not in allowed_transitions[order.status]:
            raise serializers.ValidationError(
                f"Invalid transition from {order.status} to {value}."
            )

        return value
