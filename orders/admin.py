import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "variant", "quantity", "unit_price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "phone_number",
        "city",
        "total_amount",
        "payment_status",
        "status",
        "created_at",
    )
    list_filter = ("status", "payment_status", "payment_method", "created_at", "city", "state")
    search_fields = ("id", "user__email", "full_name", "phone_number", "city", "postal_code")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    inlines = [OrderItemInline]
    actions = ["mark_confirmed", "mark_shipped", "mark_delivered", "mark_cancelled", "export_as_csv"]

    @admin.action(description="Export selected orders as CSV")
    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="orders.csv"'
        writer = csv.writer(response)

        writer.writerow(
            [
                "Order ID",
                "Customer Name",
                "Phone",
                "Email",
                "City",
                "State",
                "Country",
                "Postal Code",
                "Total Amount",
                "Payment Status",
                "Order Status",
                "Date",
            ]
        )

        for order in queryset.order_by("-created_at"):
            writer.writerow(
                [
                    order.id,
                    order.full_name,
                    order.phone_number,
                    order.email,
                    order.city,
                    order.state,
                    order.country,
                    order.postal_code,
                    order.total_amount,
                    order.payment_status,
                    order.status,
                    order.created_at.isoformat(),
                ]
            )

        return response

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

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "variant", "quantity", "unit_price")
    search_fields = ("order__id", "product__name")
