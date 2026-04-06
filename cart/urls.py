from django.urls import path

from .views import AddToCartView, CartDetailView, RemoveCartItemView, UpdateCartItemView

urlpatterns = [
    path("", CartDetailView.as_view(), name="cart_detail"),
    path("add/", AddToCartView.as_view(), name="add_to_cart"),
    path("item/<int:pk>/update/", UpdateCartItemView.as_view(), name="update_cart_item"),
    path("item/<int:pk>/remove/", RemoveCartItemView.as_view(), name="remove_cart_item"),
]
