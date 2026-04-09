from rest_framework import serializers

from products.models import Collection

from .models import HeroBanner, HomeSection, SiteSettings


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


class HeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroBanner
        fields = ["id", "title", "subtitle", "image", "button_text", "button_link"]


class HomeSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeSection
        fields = [
            "id",
            "title",
            "subtitle",
            "image",
            "section_type",
            "order",
            "button_text",
            "button_link",
        ]


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ["id", "name", "description", "image"]


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ["site_name", "logo", "footer_text", "contact_email", "whatsapp_number"]


class HomepageCMSResponseSerializer(serializers.Serializer):
    hero_banner = HeroBannerSerializer(allow_null=True)
    sections = HomeSectionSerializer(many=True)
    collections = CollectionSerializer(many=True)
    site_settings = SiteSettingsSerializer(allow_null=True)
