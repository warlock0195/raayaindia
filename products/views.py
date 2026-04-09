from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from core.permissions import IsVendorOwnerOrAdmin
from vendors.models import Vendor

from .models import Product
from .serializers import ProductDetailSerializer, ProductListSerializer, ProductWriteSerializer


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["category", "subcategory", "collection", "brand", "is_active", "vendor"]
    search_fields = ["name", "description", "tags"]
    ordering_fields = ["created_at", "price"]

    @method_decorator(cache_page(60 * 5))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_queryset(self):
        queryset = (
            Product.objects.filter(is_active=True)
            .select_related("category", "subcategory", "collection", "vendor")
            .prefetch_related("images", "variants")
        )

        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        size = self.request.query_params.get("size")
        color = self.request.query_params.get("color")

        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if size:
            queryset = queryset.filter(variants__size=size)
        if color:
            queryset = queryset.filter(variants__color__iexact=color)

        return queryset.distinct()


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Product.objects.filter(is_active=True)
            .select_related("category", "subcategory", "collection", "vendor")
            .prefetch_related("images", "variants")
        )


class VendorProductCreateView(generics.CreateAPIView):
    serializer_class = ProductWriteSerializer
    permission_classes = [IsVendorOwnerOrAdmin]
    throttle_scope = "order_manage"

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "admin":
            vendor_id = self.request.data.get("vendor")
            if not vendor_id:
                raise ValidationError({"vendor": "This field is required for admin product creation."})
            vendor = get_object_or_404(Vendor, id=vendor_id)
            serializer.save(vendor=vendor)
            return

        vendor = Vendor.objects.filter(owner=user, is_active=True).first()
        if not vendor:
            raise ValidationError({"vendor": "Vendor profile not found."})
        serializer.save(vendor=vendor)


class VendorProductManageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductWriteSerializer
    permission_classes = [IsVendorOwnerOrAdmin]
    throttle_scope = "order_manage"
    lookup_field = "id"

    def get_queryset(self):
        queryset = Product.objects.select_related("vendor")
        if self.request.user.role == "admin":
            return queryset
        return queryset.filter(vendor__owner=self.request.user)
