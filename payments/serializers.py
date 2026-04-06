from rest_framework import serializers

from .models import PaymentTransaction


class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = [
            "id",
            "order",
            "provider",
            "provider_order_id",
            "provider_payment_id",
            "status",
            "amount",
            "raw_response",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class RazorpayCreateOrderSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()


class RazorpayVerifySerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    razorpay_order_id = serializers.CharField(max_length=255)
    razorpay_payment_id = serializers.CharField(max_length=255)
    razorpay_signature = serializers.CharField(max_length=255)
