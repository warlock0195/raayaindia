import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { authApi, orderApi, paymentApi } from "../api/endpoints";
import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { trackEvent } from "../utils/analytics";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { formatCurrency } from "../utils/formatters";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, clearLocalCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [customer, setCustomer] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    order_note: "Our team will contact you for payment confirmation and delivery details.",
  });

  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    authApi
      .addresses()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.results || [];
        setAddresses(list);
        if (list.length) {
          setSelectedAddress(String(list[0].id));
        }
      })
      .catch(() => setAddresses([]));
  }, [isAuthenticated, navigate]);

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setPlacingOrder(true);
      let shippingAddressId = selectedAddress;

      if (!shippingAddressId) {
        const createdAddress = await authApi.createAddress({
          ...form,
          is_default: true,
        });
        shippingAddressId = createdAddress.id;
        setSelectedAddress(String(createdAddress.id));
      }

      const order = await orderApi.checkout({
        shipping_address_id: Number(shippingAddressId),
        payment_method: paymentMethod,
        full_name: customer.full_name,
        phone_number: customer.phone_number,
        email: customer.email,
        address_line_1: form.line1,
        address_line_2: form.line2,
        city: form.city,
        state: form.state,
        country: form.country,
        postal_code: form.postal_code,
        order_note: customer.order_note,
      });

      trackEvent({
        eventType: "checkout",
        path: window.location.pathname,
        orderId: order.id,
        metadata: { payment_method: paymentMethod },
      });

      if (paymentMethod === "cod") {
        trackEvent({
          eventType: "order_completed",
          path: window.location.pathname,
          orderId: order.id,
          metadata: { payment_method: "cod" },
        });
        clearLocalCart();
        navigate("/payment-confirmation", { state: { success: true, orderId: order.id } });
        return;
      }

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error("Unable to load payment gateway.");
      }

      const razorpayOrder = await paymentApi.createRazorpayOrder({ order_id: order.id });

      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount_paise,
        currency: razorpayOrder.currency,
        name: "Raaya India",
        description: `Order #${order.id}`,
        order_id: razorpayOrder.razorpay_order_id,
        prefill: {
          name: razorpayOrder.customer?.name || "",
          email: razorpayOrder.customer?.email || "",
          contact: razorpayOrder.customer?.contact || "",
        },
        theme: { color: "#C5A46D" },
        handler: async function (response) {
          try {
            await paymentApi.verifyRazorpayPayment({
              order_id: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            trackEvent({
              eventType: "order_completed",
              path: window.location.pathname,
              orderId: order.id,
              metadata: { payment_method: "online" },
            });
            clearLocalCart();
            navigate("/payment-confirmation", { state: { success: true, orderId: order.id } });
          } catch {
            navigate("/payment-confirmation", { state: { success: false, orderId: order.id } });
          }
        },
        modal: {
          ondismiss: function () {
            navigate("/payment-confirmation", { state: { success: false, orderId: order.id } });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to place order. Please check details and try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="section-container py-10 md:py-14">
      <SectionHeading eyebrow="Checkout" title="Finalize Your Order" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={placeOrder} className="luxury-card space-y-4 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-raayaGold">Customer Details</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="border border-black/20 bg-transparent px-3 py-3 text-sm"
              placeholder="Full name"
              value={customer.full_name}
              onChange={(e) => setCustomer((p) => ({ ...p, full_name: e.target.value }))}
            />
            <input
              className="border border-black/20 bg-transparent px-3 py-3 text-sm"
              placeholder="Phone number"
              value={customer.phone_number}
              onChange={(e) => setCustomer((p) => ({ ...p, phone_number: e.target.value }))}
            />
            <input
              className="border border-black/20 bg-transparent px-3 py-3 text-sm sm:col-span-2"
              placeholder="Email"
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          <p className="text-xs uppercase tracking-[0.25em] text-raayaGold">Shipping Address</p>

          {addresses.length ? (
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full border border-black/20 bg-transparent px-3 py-3 text-sm"
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.line1}, {address.city}, {address.state}
                </option>
              ))}
            </select>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="border border-black/20 bg-transparent px-3 py-3 text-sm"
                placeholder="Address line 1"
                value={form.line1}
                onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
              />
              <input
                className="border border-black/20 bg-transparent px-3 py-3 text-sm"
                placeholder="Address line 2"
                value={form.line2}
                onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
              />
              <input
                className="border border-black/20 bg-transparent px-3 py-3 text-sm"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              />
              <input
                className="border border-black/20 bg-transparent px-3 py-3 text-sm"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
              />
              <input
                className="border border-black/20 bg-transparent px-3 py-3 text-sm"
                placeholder="Postal Code"
                value={form.postal_code}
                onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))}
              />
              <input
                className="border border-black/20 bg-transparent px-3 py-3 text-sm"
                placeholder="Country"
                value={form.country}
                onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
              />
            </div>
          )}
          <textarea
            className="min-h-24 w-full border border-black/20 bg-transparent px-3 py-3 text-sm"
            placeholder="Order note"
            value={customer.order_note}
            onChange={(e) => setCustomer((p) => ({ ...p, order_note: e.target.value }))}
          />

          <p className="pt-2 text-xs uppercase tracking-[0.25em] text-raayaGold">Payment Method</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`border px-3 py-3 text-sm ${paymentMethod === "cod" ? "border-raayaGold text-raayaGold" : "border-black/20"}`}
            >
              Cash on Delivery (COD)
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              className={`border px-3 py-3 text-sm ${
                paymentMethod === "online" ? "border-raayaGold text-raayaGold" : "border-black/20"
              }`}
            >
              Online Payment (Razorpay)
            </button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button type="submit" className="raaya-button w-full" disabled={placingOrder}>
            {placingOrder
              ? "Processing..."
              : paymentMethod === "online"
                ? "Proceed to Secure Payment"
                : "Place Order"}
          </button>
        </form>

        <aside className="luxury-card h-fit space-y-4 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-raayaGold">Order Summary</p>
          {(cart.items || []).map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p>{item.product_name}</p>
                <p className="text-black/60">Qty {item.quantity}</p>
              </div>
              <p>{formatCurrency(item.total_price)}</p>
            </div>
          ))}
          <div className="border-t border-black/10 pt-3">
            <p className="font-serif text-2xl">Total: {formatCurrency(cart.total_amount)}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
