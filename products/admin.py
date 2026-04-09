from django.contrib import admin
from django.utils.html import format_html

from .models import Collection, Product, ProductImage, ProductVariant


class StockAvailabilityFilter(admin.SimpleListFilter):
    title = "stock"
    parameter_name = "stock_state"

    def lookups(self, request, model_admin):
        return (
            ("in_stock", "In Stock"),
            ("low_stock", "Low Stock (< 10)"),
            ("out_of_stock", "Out of Stock"),
        )

    def queryset(self, request, queryset):
        if self.value() == "in_stock":
            return queryset.filter(stock_quantity__gt=10)
        if self.value() == "low_stock":
            return queryset.filter(stock_quantity__gt=0, stock_quantity__lte=10)
        if self.value() == "out_of_stock":
            return queryset.filter(stock_quantity=0)
        return queryset


class PriceBandFilter(admin.SimpleListFilter):
    title = "price band"
    parameter_name = "price_band"

    def lookups(self, request, model_admin):
        return (
            ("budget", "Budget (< 1000)"),
            ("mid", "Mid (1000-5000)"),
            ("premium", "Premium (> 5000)"),
        )

    def queryset(self, request, queryset):
        if self.value() == "budget":
            return queryset.filter(price__lt=1000)
        if self.value() == "mid":
            return queryset.filter(price__gte=1000, price__lte=5000)
        if self.value() == "premium":
            return queryset.filter(price__gt=5000)
        return queryset


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "is_primary", "preview")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj and obj.image:
            return format_html('<img src="{}" style="height: 72px; width: 72px; object-fit: cover; border: 1px solid #ddd;" />', obj.image.url)
        return "No image"

    preview.short_description = "Preview"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("name", "image_preview", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description")
    list_editable = ("is_active",)
    readonly_fields = ("image_preview", "created_at")

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height: 64px; width: 64px; object-fit: cover; border: 1px solid #ddd;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Image"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "image_preview",
        "vendor",
        "category",
        "collection",
        "price",
        "stock_quantity",
        "is_active",
    )
    list_filter = (
        "is_active",
        "category",
        "collection",
        "brand",
        "vendor",
        StockAvailabilityFilter,
        PriceBandFilter,
    )
    search_fields = ("name", "sku", "tags", "brand")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("is_active", "collection")
    inlines = [ProductImageInline, ProductVariantInline]
    actions = ["mark_active", "mark_inactive"]

    def image_preview(self, obj):
        primary_image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary_image and primary_image.image:
            return format_html('<img src="{}" style="height: 52px; width: 52px; object-fit: cover; border: 1px solid #ddd;" />', primary_image.image.url)
        return "No image"

    image_preview.short_description = "Image"

    @admin.action(description="Mark selected products active")
    def mark_active(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Mark selected products inactive")
    def mark_inactive(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "is_primary", "preview", "created_at")
    list_filter = ("is_primary", "created_at")
    search_fields = ("product__name", "alt_text")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 220px; width: auto; border: 1px solid #ddd;" />', obj.image.url)
        return "No image"

    preview.short_description = "Preview"
