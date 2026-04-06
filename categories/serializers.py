from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image", "parent", "subcategories", "is_active", "created_at"]

    def get_subcategories(self, obj):
        queryset = obj.subcategories.filter(is_active=True)
        return CategoryChildSerializer(queryset, many=True, context=self.context).data


class CategoryChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image", "parent"]
