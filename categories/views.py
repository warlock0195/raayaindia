from rest_framework import generics, permissions

from .models import Category
from .serializers import CategorySerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True, parent__isnull=True).prefetch_related("subcategories")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
