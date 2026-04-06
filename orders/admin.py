from django.contrib import admin
from django.utils.html import format_html

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "variant", "quantity", "unit_price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total_amount", "status", "payment_method", "created_at", "status_buttons")
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("id", "user__email")
    readonly_fields = ("created_at", "updated_at")
    inlines = [OrderItemInline]
    actions = ["mark_confirmed", "mark_shipped", "mark_delivered", "mark_cancelled"]

    @admin.action(description="Mark selected orders confirmed")
    def mark_confirmed(self, request, queryset):
        queryset.update(status=Order.Status.CONFIRMED)

    @admin.action(description="Mark selected orders shipped")
    def mark_shipped(self, request, queryset):
        queryset.update(status=Order.Status.SHIPPED)

    @admin.action(description="Mark selected orders delivered")
    def mark_delivered(self, request, queryset):
        queryset.update(status=Order.Status.DELIVERED)

    @admin.action(description="Mark selected orders cancelled")
    def mark_cancelled(self, request, queryset):
        queryset.update(status=Order.Status.CANCELLED)

    def status_buttons(self, obj):
        return format_html(
            "<span style='padding:4px 8px;border-radius:8px;background:#f0f0f0'>{}</span>",
            obj.get_status_display(),
        )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "variant", "quantity", "unit_price")
    search_fields = ("order__id", "product__name")
