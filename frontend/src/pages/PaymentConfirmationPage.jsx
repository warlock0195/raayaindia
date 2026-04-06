import { CheckCircle2, XCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const PaymentConfirmationPage = () => {
  const location = useLocation();
  const isSuccess = location.state?.success;
  const orderId = location.state?.orderId;

  return (
    <div className="section-container py-16">
      <div className="mx-auto max-w-2xl luxury-card p-10 text-center">
        <div className="mx-auto mb-5 w-fit">
          {isSuccess ? <CheckCircle2 size={54} className="text-green-600" /> : <XCircle size={54} className="text-red-600" />}
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-raayaGold">Payment Update</p>
        <h1 className="mt-3 font-serif text-4xl">
          {isSuccess ? "Payment Successful" : "Payment Not Completed"}
        </h1>
        <p className="mt-4 text-black/70">
          {isSuccess
            ? `Your order #${orderId || ""} is confirmed. Thank you for choosing Raaya India.`
            : "We could not confirm your payment. You can retry checkout from your cart."}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="raaya-button" to="/shop">
            Continue Shopping
          </Link>
          <Link className="raaya-outline-button" to="/cart">
            Go to Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
