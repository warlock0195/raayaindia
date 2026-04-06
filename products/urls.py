from django.urls import path

from .views import ProductDetailView, ProductListView, VendorProductCreateView, VendorProductManageView

urlpatterns = [
    path("", ProductListView.as_view(), name="product_list"),
    path("<slug:slug>/", ProductDetailView.as_view(), name="product_detail"),
    path("manage/create/", VendorProductCreateView.as_view(), name="vendor_product_create"),
    path("manage/<int:id>/", VendorProductManageView.as_view(), name="vendor_product_manage"),
]
