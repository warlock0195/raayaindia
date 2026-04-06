from django.contrib import admin

from .models import PaymentTransaction, RazorpayConfig


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "provider", "status", "amount", "created_at")
    list_filter = ("provider", "status")
    search_fields = ("order__id", "provider_order_id", "provider_payment_id")


@admin.register(RazorpayConfig)
class RazorpayConfigAdmin(admin.ModelAdmin):
    list_display = ("key_id", "is_active", "updated_at")
