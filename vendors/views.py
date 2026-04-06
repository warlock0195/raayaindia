from rest_framework import generics, permissions

from .models import Vendor
from .serializers import VendorSerializer


class VendorListView(generics.ListAPIView):
    queryset = Vendor.objects.filter(is_active=True).select_related("owner")
    serializer_class = VendorSerializer
    permission_classes = [permissions.AllowAny]
