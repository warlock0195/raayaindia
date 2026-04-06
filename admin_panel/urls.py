from django.urls import path

from .views import (
    AbandonedCartListView,
    AdminInsightsView,
    AnalyticsTrackView,
    DashboardStatsView,
    ProductCSVUploadView,
    TriggerAbandonedCartReminderView,
)

urlpatterns = [
    path("dashboard/stats/", DashboardStatsView.as_view(), name="admin_dashboard_stats"),
    path("products/bulk-upload/", ProductCSVUploadView.as_view(), name="admin_products_bulk_upload"),
    path("analytics/track/", AnalyticsTrackView.as_view(), name="analytics_track"),
    path("dashboard/insights/", AdminInsightsView.as_view(), name="admin_dashboard_insights"),
    path("abandoned-carts/", AbandonedCartListView.as_view(), name="abandoned_cart_list"),
    path("abandoned-carts/remind/", TriggerAbandonedCartReminderView.as_view(), name="abandoned_cart_remind"),
]
