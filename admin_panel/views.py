import csv
from io import TextIOWrapper

from django.db.models import Count, Sum
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.marketing import get_abandoned_cart_candidates, send_abandoned_cart_reminder, track_analytics_event
from core.permissions import IsAdminRole
from orders.models import Order
from orders.models import OrderItem
from products.models import Product

from .models import AbandonedCart
from .serializers import AbandonedCartReminderSerializer, AnalyticsTrackSerializer


class DashboardStatsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        aggregate = Order.objects.exclude(status=Order.Status.CANCELLED).aggregate(
            total_orders=Count("id"),
            total_revenue=Sum("total_amount"),
        )
        data = {
            "total_orders": aggregate["total_orders"] or 0,
            "total_revenue": aggregate["total_revenue"] or 0,
            "total_products": Product.objects.count(),
        }
        return Response(data)


class ProductCSVUploadView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not file_obj.name.endswith(".csv"):
            return Response({"detail": "Only CSV files are supported."}, status=status.HTTP_400_BAD_REQUEST)

        decoded = TextIOWrapper(file_obj.file, encoding="utf-8")
        reader = csv.DictReader(decoded)

        created = 0
        skipped = 0
        errors = []

        for index, row in enumerate(reader, start=2):
            try:
                _, created_flag = Product.objects.get_or_create(
                    sku=row["sku"],
                    defaults={
                        "vendor_id": row["vendor_id"],
                        "category_id": row["category_id"],
                        "subcategory_id": row.get("subcategory_id") or None,
                        "name": row["name"],
                        "slug": row["slug"],
                        "description": row.get("description", ""),
                        "price": row["price"],
                        "discount_price": row.get("discount_price") or None,
                        "stock_quantity": row.get("stock_quantity") or 0,
                        "tags": row.get("tags", ""),
                        "brand": row.get("brand", ""),
                        "is_active": str(row.get("is_active", "true")).lower() == "true",
                    },
                )
                if created_flag:
                    created += 1
                else:
                    skipped += 1
            except Exception as exc:
                errors.append({"line": index, "error": str(exc)})

        return Response(
            {
                "created": created,
                "skipped": skipped,
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )


class AnalyticsTrackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = AnalyticsTrackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        product = Product.objects.filter(id=data.get("product_id")).first() if data.get("product_id") else None
        order = Order.objects.filter(id=data.get("order_id")).first() if data.get("order_id") else None

        track_analytics_event(
            session_id=data["session_id"],
            event_type=data["event_type"],
            user=request.user if getattr(request.user, "is_authenticated", False) else None,
            path=data.get("path", ""),
            product=product,
            order=order,
            metadata=data.get("metadata", {}),
        )
        return Response({"tracked": True}, status=status.HTTP_201_CREATED)


class AdminInsightsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        from .models import AnalyticsEvent

        total_visitors = AnalyticsEvent.objects.values("session_id").distinct().count()
        converted_sessions = (
            AnalyticsEvent.objects.filter(event_type=AnalyticsEvent.EventTypes.ORDER_COMPLETED)
            .values("session_id")
            .distinct()
            .count()
        )
        conversion_rate = round((converted_sessions / total_visitors) * 100, 2) if total_visitors else 0.0

        top_products_qs = (
            OrderItem.objects.values("product__id", "product__name")
            .annotate(total_orders=Count("id"))
            .order_by("-total_orders")[:5]
        )
        top_products = [
            {
                "product_id": item["product__id"],
                "product_name": item["product__name"],
                "total_orders": item["total_orders"],
            }
            for item in top_products_qs
        ]

        return Response(
            {
                "total_visitors": total_visitors,
                "conversion_rate": conversion_rate,
                "top_products": top_products,
            }
        )


class AbandonedCartListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        carts = AbandonedCart.objects.filter(is_converted=False).select_related("user")[:100]
        data = [
            {
                "id": item.id,
                "user_email": item.user.email,
                "last_activity": item.last_activity,
                "reminder_status": item.reminder_status,
                "cart_snapshot": item.cart_snapshot,
            }
            for item in carts
        ]
        return Response(data)


class TriggerAbandonedCartReminderView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        serializer = AbandonedCartReminderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        hours = serializer.validated_data["hours"]

        candidates = get_abandoned_cart_candidates(hours=hours)
        sent = 0
        for record in candidates:
            if send_abandoned_cart_reminder(record):
                sent += 1

        return Response(
            {
                "total_candidates": candidates.count(),
                "reminders_sent": sent,
            },
            status=status.HTTP_200_OK,
        )
