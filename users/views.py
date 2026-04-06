from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from cart.models import Cart

from .models import Address
from .serializers import (
    AddressSerializer,
    RaayaTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()
        Cart.objects.get_or_create(user=user)


class LoginView(TokenObtainPairView):
    serializer_class = RaayaTokenObtainPairSerializer
    throttle_scope = "auth"


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        is_default = serializer.validated_data.get("is_default", False)
        if is_default:
            Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user)


class AddressUpdateView(generics.UpdateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        is_default = serializer.validated_data.get("is_default", False)
        if is_default:
            Address.objects.filter(user=self.request.user, is_default=True).exclude(
                id=self.get_object().id
            ).update(is_default=False)
        serializer.save()


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "Raaya India API"}, status=status.HTTP_200_OK)
