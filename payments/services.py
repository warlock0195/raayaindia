import hmac
from decimal import Decimal
from hashlib import sha256

import razorpay


class RazorpayService:
    def __init__(self, key_id=None, key_secret=None):
        self.key_id = key_id
        self.key_secret = key_secret
        self.client = razorpay.Client(auth=(key_id, key_secret)) if key_id and key_secret else None

    def create_order_payload(self, amount, currency="INR", receipt=None):
        return {
            "amount": int(Decimal(amount) * 100),
            "currency": currency,
            "receipt": receipt,
            "notes": {"source": "raaya_india"},
        }

    def create_order(self, amount, receipt):
        if not self.client:
            raise ValueError("Razorpay client is not configured")
        payload = self.create_order_payload(amount=amount, receipt=receipt)
        return self.client.order.create(data=payload)

    def verify_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        expected_signature = hmac.new(
            self.key_secret.encode("utf-8"),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
            sha256,
        ).hexdigest()
        return hmac.compare_digest(expected_signature, razorpay_signature)
