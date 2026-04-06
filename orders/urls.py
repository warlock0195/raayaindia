from django.urls import path

from .views import (
    AdminOrderStatusUpdateView,
    CancelOrderView,
    CheckoutView,
    OrderDetailView,
    OrderHistoryView,
    OrderTimelineView,
)

urlpatterns = [
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("", OrderHistoryView.as_view(), name="order_history"),
    path("<int:pk>/", OrderDetailView.as_view(), name="order_detail"),
    path("<int:pk>/timeline/", OrderTimelineView.as_view(), name="order_timeline"),
    path("<int:pk>/cancel/", CancelOrderView.as_view(), name="order_cancel"),
    path("<int:pk>/status/", AdminOrderStatusUpdateView.as_view(), name="admin_order_status_update"),
]
