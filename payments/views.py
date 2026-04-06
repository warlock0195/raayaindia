import logging
import os

from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from core.marketing import notify_order_confirmation
from orders.models import Order

from .models import PaymentTransaction
from .serializers import (
    PaymentTransactionSerializer,
    RazorpayCreateOrderSerializer,
    RazorpayVerifySerializer,
)
from .services import RazorpayService

logger = logging.getLogger("payments")


class PaymentTransactionListView(generics.ListAPIView):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        logger.info("Payment transaction list requested user_id=%s", self.request.user.id)
        return PaymentTransaction.objects.filter(order__user=self.request.user).select_related("order")


class RazorpayCreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "checkout"

    def post(self, request):
        serializer = RazorpayCreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = get_object_or_404(
            Order.objects.filter(
                user=request.user,
                payment_method=Order.PaymentMethod.ONLINE,
                payment_status=Order.PaymentStatus.PENDING,
            ),
            id=serializer.validated_data["order_id"],
        )

        tx = (
            PaymentTransaction.objects.filter(order=order, provider="razorpay")
            .order_by("-created_at")
            .first()
        )
        if not tx:
            tx = PaymentTransaction.objects.create(
                order=order,
                provider="razorpay",
                status=PaymentTransaction.Status.INITIATED,
                amount=order.total_amount,
            )

        key_id = os.getenv("RAZORPAY_KEY_ID", "")
        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        if not key_id or not key_secret:
            raise ValidationError({"detail": "Razorpay is not configured."})

        service = RazorpayService(key_id=key_id, key_secret=key_secret)
        rp_order = service.create_order(amount=order.total_amount, receipt=f"raaya-order-{order.id}")

        tx.provider_order_id = rp_order.get("id", "")
        tx.status = PaymentTransaction.Status.PENDING
        tx.raw_response = rp_order
        tx.save(update_fields=["provider_order_id", "status", "raw_response"])

        logger.info("Razorpay order created order_id=%s razorpay_order_id=%s", order.id, tx.provider_order_id)
        return Response(
            {
                "key_id": key_id,
                "order_id": order.id,
                "amount": str(order.total_amount),
                "amount_paise": int(order.total_amount * 100),
                "currency": rp_order.get("currency", "INR"),
                "razorpay_order_id": tx.provider_order_id,
                "transaction_id": tx.id,
                "customer": {
                    "name": request.user.name,
                    "email": request.user.email,
                    "contact": request.user.phone_number,
                },
            },
            status=status.HTTP_200_OK,
        )


class RazorpayVerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "checkout"

    def post(self, request):
        serializer = RazorpayVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = get_object_or_404(
            Order.objects.filter(user=request.user, payment_method=Order.PaymentMethod.ONLINE),
            id=serializer.validated_data["order_id"],
        )

        tx = (
            PaymentTransaction.objects.filter(order=order, provider="razorpay")
            .order_by("-created_at")
            .first()
        )
        if not tx:
            raise ValidationError({"detail": "Payment transaction not found."})

        key_id = os.getenv("RAZORPAY_KEY_ID", "")
        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        if not key_id or not key_secret:
            raise ValidationError({"detail": "Razorpay is not configured."})

        service = RazorpayService(key_id=key_id, key_secret=key_secret)

        is_valid = service.verify_signature(
            razorpay_order_id=serializer.validated_data["razorpay_order_id"],
            razorpay_payment_id=serializer.validated_data["razorpay_payment_id"],
            razorpay_signature=serializer.validated_data["razorpay_signature"],
        )

        tx.provider_order_id = serializer.validated_data["razorpay_order_id"]
        tx.provider_payment_id = serializer.validated_data["razorpay_payment_id"]
        tx.raw_response = {
            "razorpay_order_id": serializer.validated_data["razorpay_order_id"],
            "razorpay_payment_id": serializer.validated_data["razorpay_payment_id"],
            "razorpay_signature": serializer.validated_data["razorpay_signature"],
        }

        if is_valid:
            tx.status = PaymentTransaction.Status.SUCCESS
            order.payment_status = Order.PaymentStatus.SUCCESS
            order.status = Order.Status.CONFIRMED
            order.save(update_fields=["payment_status", "status", "updated_at"])
            notify_order_confirmation(order)
            logger.info("Razorpay payment verified order_id=%s payment_id=%s", order.id, tx.provider_payment_id)
        else:
            tx.status = PaymentTransaction.Status.FAILED
            order.payment_status = Order.PaymentStatus.FAILED
            order.save(update_fields=["payment_status", "updated_at"])
            logger.warning("Razorpay payment verification failed order_id=%s", order.id)

        tx.save(update_fields=["provider_order_id", "provider_payment_id", "status", "raw_response"])

        if not is_valid:
            raise ValidationError({"detail": "Invalid payment signature."})

        return Response(
            {
                "order_id": order.id,
                "payment_status": order.payment_status,
                "status": order.status,
            },
            status=status.HTTP_200_OK,
        )
