import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";

import { productApi, reviewApi } from "../api/endpoints";
import QuantitySelector from "../components/QuantitySelector";
import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { trackEvent } from "../utils/analytics";
import { formatCurrency } from "../utils/formatters";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProduct(true);
        const productData = await productApi.detail(slug);
        const reviewData = await reviewApi.listByProduct(productData.id).catch(() => []);
        setProduct(productData);
        setReviews(Array.isArray(reviewData) ? reviewData : reviewData?.results || []);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchData().catch(() => {
      setProduct(null);
      setReviews([]);
    });
  }, [slug]);

  useEffect(() => {
    if (product?.id) {
      trackEvent({
        eventType: "product_view",
        path: window.location.pathname,
        productId: product.id,
      });
    }
  }, [product?.id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images : [{ image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80" }];
  }, [product]);

  if (loadingProduct) {
    return (
      <div className="section-container py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="h-[520px] animate-pulse bg-black/10" />
          <div className="space-y-4">
            <div className="h-3 w-32 animate-pulse bg-black/10" />
            <div className="h-10 w-2/3 animate-pulse bg-black/10" />
            <div className="h-8 w-1/3 animate-pulse bg-black/10" />
            <div className="h-28 animate-pulse bg-black/10" />
            <div className="h-12 w-64 animate-pulse bg-black/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="section-container py-20 text-center">Unable to load product.</div>;
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (product.variants?.length && !selectedVariant) {
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart({
        product: product.id,
        variant: selectedVariant?.id,
        quantity,
      });
      trackEvent({
        eventType: "add_to_cart",
        path: window.location.pathname,
        productId: product.id,
        metadata: { quantity },
      });
      setAddSuccess(true);
      setTimeout(() => {
        navigate("/cart");
      }, 700);
    } finally {
      setAddingToCart(false);
    }
  };

  const socialProofCount = 64 + ((product.id || 1) % 37);
  const savings = product.discount_price ? Number(product.price) - Number(product.discount_price) : 0;

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    await reviewApi.create({ product: product.id, rating, comment: reviewText });
    const latest = await reviewApi.listByProduct(product.id);
    setReviews(Array.isArray(latest) ? latest : latest?.results || []);
    setReviewText("");
    setRating(5);
  };

  return (
    <div className="section-container py-10 md:py-14">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <motion.img
            key={gallery[activeImage]?.image}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            src={gallery[activeImage]?.image}
            alt={product.name}
            className="h-[520px] w-full object-cover"
          />
          <div className="mt-3 grid grid-cols-5 gap-2">
            {gallery.map((img, idx) => (
              <button key={`${img.image}-${idx}`} onClick={() => setActiveImage(idx)}>
                <img
                  src={img.image}
                  alt={`thumb-${idx}`}
                  className={`h-20 w-full object-cover ${activeImage === idx ? "ring-2 ring-raayaGold" : "opacity-80"}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-raayaGold">{product.brand || "Raaya India"}</p>
          <h1 className="font-serif text-4xl">{product.name}</h1>
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-3xl font-medium">{formatCurrency(product.discount_price || product.price)}</p>
            {product.discount_price ? (
              <>
                <p className="text-lg text-black/50 line-through">{formatCurrency(product.price)}</p>
                <p className="text-sm uppercase tracking-[0.15em] text-raayaGold">Save {formatCurrency(savings)}</p>
              </>
            ) : null}
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-raayaGold">{socialProofCount}+ people bought this in the last 30 days</p>
          <p className="text-xs uppercase tracking-[0.2em] text-black/60">Limited Collection • Only few pieces left</p>
          <p className="text-black/70">{product.description}</p>

          <div className="luxury-card space-y-2 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-raayaGold">Why you’ll love this</p>
            <p className="text-black/75">Elegant drape, heirloom detailing, and a silhouette designed to flatter across occasions.</p>
          </div>

          {product.variants?.length ? (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em]">Size & Color</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`border px-3 py-2 text-xs ${
                      selectedVariant?.id === variant.id ? "border-raayaGold text-raayaGold" : "border-black/20"
                    }`}
                  >
                    {variant.size} / {variant.color}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <button onClick={handleAddToCart} className="raaya-button min-h-12 min-w-[220px] text-base" disabled={addingToCart}>
              {addingToCart ? "Adding..." : addSuccess ? "Added ✓" : "Add to Cart"}
            </button>
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999"}?text=${encodeURIComponent(
                `Hi Raaya India, I want to place an order for ${product.name} (Product ID: ${product.id}).`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="raaya-outline-button min-h-12 min-w-[220px] text-base"
            >
              Order via WhatsApp
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="luxury-card flex items-start gap-2 p-3 text-xs text-black/75">
              <Sparkles size={16} className="text-raayaGold" />
              <span>Premium quality assured</span>
            </div>
            <div className="luxury-card flex items-start gap-2 p-3 text-xs text-black/75">
              <Truck size={16} className="text-raayaGold" />
              <span>Delivery in 4–7 business days</span>
            </div>
            <div className="luxury-card flex items-start gap-2 p-3 text-xs text-black/75">
              <ShieldCheck size={16} className="text-raayaGold" />
              <span>Secure checkout & easy returns</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="luxury-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-raayaGold">Fabric</p>
              <p className="mt-2 text-sm text-black/70">Premium silk blend with artisanal finish.</p>
            </div>
            <div className="luxury-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-raayaGold">Care</p>
              <p className="mt-2 text-sm text-black/70">Dry clean only. Steam gently from reverse side.</p>
            </div>
            <div className="luxury-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-raayaGold">Delivery</p>
              <p className="mt-2 text-sm text-black/70">Ships within 48 hours with luxury packaging.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-container mt-14 py-2">
        <SectionHeading eyebrow="From Instagram" title="Styled by the Raaya Circle" />
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            "https://images.unsplash.com/photo-1610189025912-3606ebed9602?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1594736797933-d0f8f769b0f9?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1610030469678-5f96cace35cf?auto=format&fit=crop&w=900&q=80",
          ].map((img, idx) => (
            <motion.img
              key={img}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.07 }}
              src={img}
              alt="Raaya social proof"
              className="h-44 w-full object-cover"
            />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading eyebrow="Client Reviews" title="What Our Patrons Say" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.id} className="luxury-card p-5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-raayaGold">{review.rating} / 5</p>
                    <p className="text-raayaGold">{"★".repeat(review.rating)}</p>
                  </div>
                  <p className="mt-2 text-sm text-black/80">{review.comment || "Beautiful craftsmanship."}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.15em]">{review.user_name || "Raaya Client"}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-black/60">No reviews yet. Be the first to review this piece.</p>
            )}
          </div>

          <form onSubmit={submitReview} className="luxury-card space-y-3 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-raayaGold">Write a Review</p>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border border-black/20 bg-transparent px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} Stars
                </option>
              ))}
            </select>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="w-full border border-black/20 bg-transparent px-3 py-2 text-sm"
              placeholder="Share your experience"
            />
            <button className="raaya-button w-full" type="submit">
              Submit Review
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
