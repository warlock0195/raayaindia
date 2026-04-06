from django.db import models


class PaymentTransaction(models.Model):
    class Status(models.TextChoices):
        INITIATED = "initiated", "Initiated"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        PENDING = "pending", "Pending"

    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE, related_name="payment_transactions")
    provider = models.CharField(max_length=50, default="razorpay")
    provider_order_id = models.CharField(max_length=255, blank=True)
    provider_payment_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["order", "status"]),
            models.Index(fields=["provider_order_id"]),
            models.Index(fields=["provider_payment_id"]),
        ]


class RazorpayConfig(models.Model):
    key_id = models.CharField(max_length=100)
    webhook_secret = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Razorpay Config ({'active' if self.is_active else 'inactive'})"
