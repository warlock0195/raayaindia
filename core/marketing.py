import json
import logging
import os
from datetime import timedelta
from urllib import error, request

from django.core.mail import send_mail
from django.utils import timezone

logger = logging.getLogger("orders")


def send_whatsapp_message(phone_number, message):
    api_url = os.getenv("WHATSAPP_API_URL", "")
    token = os.getenv("WHATSAPP_API_TOKEN", "")
    sender = os.getenv("WHATSAPP_SENDER_ID", "")

    if not api_url or not token or not sender or not phone_number:
        return False

    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "text",
        "text": {"body": message},
    }

    req = request.Request(
        api_url,
        method="POST",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "X-Sender": sender,
        },
    )

    try:
        with request.urlopen(req, timeout=10):
            return True
    except error.URLError as exc:
        logger.error("WhatsApp send failed: %s", exc)
        return False


def send_order_email(order, subject, body):
    recipient = order.user.email
    from_email = os.getenv("DEFAULT_FROM_EMAIL", "noreply@raayaindia.com")
    if not recipient:
        return

    send_mail(subject=subject, message=body, from_email=from_email, recipient_list=[recipient], fail_silently=True)


def notify_order_confirmation(order):
    message = f"Your Raaya India order #{order.id} has been placed successfully."
    send_whatsapp_message(order.user.phone_number, message)
    send_order_email(
        order,
        subject=f"Raaya India Order Confirmation #{order.id}",
        body=(
            f"Hi {order.user.name},\n\n"
            f"Your order #{order.id} is confirmed.\n"
            f"Total: INR {order.total_amount}\n"
            f"Payment method: {order.get_payment_method_display()}\n\n"
            "Thank you for shopping with Raaya India."
        ),
    )


def notify_order_status_update(order):
    message = f"Update: Your Raaya India order #{order.id} is now {order.get_status_display()}."
    send_whatsapp_message(order.user.phone_number, message)
    send_order_email(
        order,
        subject=f"Raaya India Order Status Update #{order.id}",
        body=f"Hi {order.user.name},\n\nYour order #{order.id} status is now {order.get_status_display()}.",
    )


def track_analytics_event(session_id, event_type, user=None, path="", product=None, order=None, metadata=None):
    from admin_panel.models import AnalyticsEvent

    if not session_id:
        return None

    return AnalyticsEvent.objects.create(
        session_id=session_id,
        user=user if getattr(user, "is_authenticated", False) else None,
        event_type=event_type,
        path=path,
        product=product,
        order=order,
        metadata=metadata or {},
    )


def upsert_abandoned_cart_snapshot(user, cart):
    from admin_panel.models import AbandonedCart

    if not user or not getattr(user, "is_authenticated", False):
        return

    snapshot = {
        "cart_id": cart.id,
        "total_amount": str(cart.total_amount),
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product.name,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "unit_price": str(item.unit_price),
            }
            for item in cart.items.select_related("product").all()
        ],
    }

    AbandonedCart.objects.update_or_create(
        user=user,
        defaults={
            "cart_snapshot": snapshot,
            "is_converted": False,
            "reminder_status": AbandonedCart.ReminderStatus.PENDING,
        },
    )


def mark_abandoned_cart_converted(user):
    from admin_panel.models import AbandonedCart

    AbandonedCart.objects.filter(user=user).update(is_converted=True)


def get_abandoned_cart_candidates(hours=2):
    from admin_panel.models import AbandonedCart

    cutoff = timezone.now() - timedelta(hours=hours)
    return AbandonedCart.objects.filter(
        is_converted=False,
        reminder_status=AbandonedCart.ReminderStatus.PENDING,
        last_activity__lte=cutoff,
    ).select_related("user")


def send_abandoned_cart_reminder(record):
    user = record.user
    if not user:
        return False

    body = f"Hi {user.name}, your Raaya India cart is waiting. Complete your purchase before pieces sell out."
    whatsapp_sent = send_whatsapp_message(user.phone_number, body)

    send_mail(
        subject="Your Raaya India cart is waiting",
        message=body,
        from_email=os.getenv("DEFAULT_FROM_EMAIL", "noreply@raayaindia.com"),
        recipient_list=[user.email] if user.email else [],
        fail_silently=True,
    )

    record.reminder_status = record.ReminderStatus.SENT
    record.save(update_fields=["reminder_status", "last_activity"])
    return whatsapp_sent
