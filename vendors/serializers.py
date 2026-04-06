from rest_framework import serializers

from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = Vendor
        fields = [
            "id",
            "store_name",
            "slug",
            "owner",
            "owner_email",
            "verification_status",
            "rating",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
