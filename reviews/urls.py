from django.urls import path

from .views import AddReviewView, ProductReviewListView

urlpatterns = [
    path("", AddReviewView.as_view(), name="add_review"),
    path("product/<int:product_id>/", ProductReviewListView.as_view(), name="product_reviews"),
]
