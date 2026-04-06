import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { cartApi } from "../api/endpoints";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total_amount: 0 });
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total_amount: 0 });
      return;
    }

    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data || { items: [], total_amount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  const addToCart = async (payload) => {
    await cartApi.add(payload);
    await loadCart();
  };

  const updateItem = async (id, quantity) => {
    await cartApi.update(id, { quantity });
    await loadCart();
  };

  const removeItem = async (id) => {
    await cartApi.remove(id);
    await loadCart();
  };

  const clearLocalCart = () => setCart({ items: [], total_amount: 0 });

  const cartCount = useMemo(
    () => (cart.items || []).reduce((acc, item) => acc + item.quantity, 0),
    [cart.items]
  );

  return (
    <CartContext.Provider
      value={{ cart, loading, cartCount, loadCart, addToCart, updateItem, removeItem, clearLocalCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
