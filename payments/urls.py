from django.urls import path

from .views import PaymentTransactionListView, RazorpayCreateOrderView, RazorpayVerifyPaymentView

urlpatterns = [
    path("transactions/", PaymentTransactionListView.as_view(), name="payment_transaction_list"),
    path("razorpay/create-order/", RazorpayCreateOrderView.as_view(), name="razorpay_create_order"),
    path("razorpay/verify/", RazorpayVerifyPaymentView.as_view(), name="razorpay_verify_payment"),
]
