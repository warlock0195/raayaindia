from rest_framework import serializers


class DashboardStatsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_products = serializers.IntegerField()


class AnalyticsTrackSerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=128)
    event_type = serializers.ChoiceField(
        choices=["page_view", "product_view", "add_to_cart", "checkout", "order_completed"]
    )
    path = serializers.CharField(max_length=300, required=False, allow_blank=True)
    product_id = serializers.IntegerField(required=False)
    order_id = serializers.IntegerField(required=False)
    metadata = serializers.DictField(required=False)


class AdminInsightsSerializer(serializers.Serializer):
    total_visitors = serializers.IntegerField()
    conversion_rate = serializers.FloatField()
    top_products = serializers.ListField()


class AbandonedCartReminderSerializer(serializers.Serializer):
    hours = serializers.IntegerField(default=2, min_value=1, max_value=72)
