from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AddressListCreateView,
    AddressUpdateView,
    HealthCheckView,
    LoginView,
    ProfileView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("addresses/", AddressListCreateView.as_view(), name="address_list_create"),
    path("addresses/<int:pk>/", AddressUpdateView.as_view(), name="address_update"),
    path("health/", HealthCheckView.as_view(), name="health_check"),
]
