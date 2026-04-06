import { Link, useNavigate } from "react-router-dom";

import QuantitySelector from "../components/QuantitySelector";
import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, loading, updateItem, removeItem } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="section-container py-20 text-center">
        <p className="font-serif text-3xl">Please sign in to view your cart.</p>
        <Link className="raaya-button mt-6" to="/auth">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container py-10 md:py-14">
      <SectionHeading eyebrow="Cart" title="Your Curated Bag" />

      {loading ? (
        <p className="mt-8 text-sm">Loading your cart...</p>
      ) : !cart.items?.length ? (
        <div className="mt-8 luxury-card p-10 text-center">
          <p className="font-serif text-2xl">Your cart is empty.</p>
          <Link to="/shop" className="raaya-button mt-6">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <article key={item.id} className="luxury-card grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"
                  alt={item.product_name}
                  className="h-28 w-full object-cover"
                />
                <div>
                  <h3 className="font-serif text-xl">{item.product_name}</h3>
                  <p className="mt-2 text-sm text-black/70">{formatCurrency(item.unit_price)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <QuantitySelector value={item.quantity} onChange={(qty) => updateItem(item.id, qty)} />
                  <button className="text-xs uppercase tracking-[0.15em] text-black/60 hover:text-raayaGold" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="luxury-card h-fit space-y-4 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-raayaGold">Order Total</p>
            <p className="font-serif text-3xl">{formatCurrency(cart.total_amount)}</p>
            <button className="raaya-button w-full" onClick={() => navigate("/checkout")}>
              Continue to Checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;
