import logging

from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from core.marketing import notify_order_confirmation, notify_order_status_update
from core.permissions import IsAdminRole

from .models import Order
from .serializers import CheckoutSerializer, OrderSerializer, OrderStatusUpdateSerializer

logger = logging.getLogger("orders")


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "checkout"

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        if order.payment_method == Order.PaymentMethod.COD:
            notify_order_confirmation(order)
        logger.info("Order created user_id=%s order_id=%s", request.user.id, order.id)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("shipping_address")
            .prefetch_related("items__product", "items__variant")
        )


class OrderTimelineView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(Order.objects.filter(user=request.user), pk=pk)
        timeline = OrderSerializer(order).data["tracking_timeline"]
        return Response({"order_id": order.id, "status": order.status, "timeline": timeline})


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "order_manage"

    def post(self, request, pk):
        order = get_object_or_404(Order.objects.filter(user=request.user), pk=pk)
        if order.status in {Order.Status.SHIPPED, Order.Status.DELIVERED, Order.Status.CANCELLED}:
            raise ValidationError({"status": "Order cannot be cancelled at this stage."})

        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])
        notify_order_status_update(order)
        logger.info("Order cancelled user_id=%s order_id=%s", request.user.id, order.id)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class AdminOrderStatusUpdateView(APIView):
    permission_classes = [IsAdminRole]
    throttle_scope = "order_manage"

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderStatusUpdateSerializer(data=request.data, context={"order": order})
        serializer.is_valid(raise_exception=True)

        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status", "updated_at"])
        notify_order_status_update(order)
        logger.info("Order status updated admin_id=%s order_id=%s status=%s", request.user.id, order.id, order.status)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("shipping_address")
            .prefetch_related("items__product", "items__variant")
        )
