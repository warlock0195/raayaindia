from django.conf import settings
from django.db import models


class AnalyticsEvent(models.Model):
    class EventTypes(models.TextChoices):
        PAGE_VIEW = "page_view", "Page View"
        PRODUCT_VIEW = "product_view", "Product View"
        ADD_TO_CART = "add_to_cart", "Add To Cart"
        CHECKOUT = "checkout", "Checkout"
        ORDER_COMPLETED = "order_completed", "Order Completed"

    session_id = models.CharField(max_length=128, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="analytics_events",
    )
    event_type = models.CharField(max_length=30, choices=EventTypes.choices, db_index=True)
    path = models.CharField(max_length=300, blank=True)
    product = models.ForeignKey(
        "products.Product",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="analytics_events",
    )
    order = models.ForeignKey(
        "orders.Order",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="analytics_events",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["session_id", "event_type"]),
            models.Index(fields=["created_at"]),
        ]


class AbandonedCart(models.Model):
    class ReminderStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="abandoned_cart",
    )
    cart_snapshot = models.JSONField(default=dict, blank=True)
    is_converted = models.BooleanField(default=False, db_index=True)
    reminder_status = models.CharField(
        max_length=20,
        choices=ReminderStatus.choices,
        default=ReminderStatus.PENDING,
        db_index=True,
    )
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-last_activity"]
        indexes = [
            models.Index(fields=["is_converted", "reminder_status"]),
            models.Index(fields=["last_activity"]),
        ]

    def __str__(self):
        return f"AbandonedCart<{self.user_id}>"
