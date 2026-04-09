from rest_framework import serializers

from .models import Product, ProductImage, ProductVariant


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary"]


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "size", "color", "variant_stock", "sku_suffix"]


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.store_name", read_only=True)
    collection_name = serializers.CharField(source="collection.name", read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "price",
            "discount_price",
            "effective_price",
            "stock_quantity",
            "brand",
            "tags",
            "category_name",
            "collection",
            "collection_name",
            "vendor_name",
            "images",
            "is_active",
            "created_at",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.store_name", read_only=True)
    collection_name = serializers.CharField(source="collection.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "discount_price",
            "effective_price",
            "stock_quantity",
            "sku",
            "tags",
            "brand",
            "category",
            "category_name",
            "subcategory",
            "subcategory_name",
            "collection",
            "collection_name",
            "vendor",
            "vendor_name",
            "fabric",
            "care_instructions",
            "delivery_time",
            "is_active",
            "images",
            "variants",
            "created_at",
            "updated_at",
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "discount_price",
            "stock_quantity",
            "sku",
            "tags",
            "brand",
            "category",
            "subcategory",
            "collection",
            "fabric",
            "care_instructions",
            "delivery_time",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        price = attrs.get("price", getattr(self.instance, "price", None))
        discount_price = attrs.get("discount_price", getattr(self.instance, "discount_price", None))
        category = attrs.get("category", getattr(self.instance, "category", None))
        subcategory = attrs.get("subcategory", getattr(self.instance, "subcategory", None))

        if discount_price is not None and price is not None and discount_price > price:
            raise serializers.ValidationError({"discount_price": "Discount price cannot exceed product price."})

        if subcategory and category and subcategory.parent_id != category.id:
            raise serializers.ValidationError({"subcategory": "Selected subcategory does not belong to category."})

        return attrs
