import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AboutPage from "./pages/AboutPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductListingPage from "./pages/ProductListingPage";
import { trackEvent } from "./utils/analytics";

function App() {
  const location = useLocation();

  useEffect(() => {
    trackEvent({ eventType: "page_view", path: location.pathname });
  }, [location.pathname]);

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/shop" element={<ProductListingPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmationPage />} />
        <Route path="/auth" element={<LoginRegisterPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
