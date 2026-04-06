import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { productApi } from "../api/endpoints";
import HeroBanner from "../components/HeroBanner";
import InstagramGallery from "../components/InstagramGallery";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import Testimonials from "../components/Testimonials";
import TrustBadges from "../components/TrustBadges";
import WhyRaayaSection from "../components/WhyRaayaSection";

const categories = [
  {
    label: "Banarasi",
    region: "Varanasi",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
  },
  {
    label: "Kanjivaram",
    region: "Tamil Nadu",
    image: "https://images.unsplash.com/photo-1610030469559-f35f2dc4f597?auto=format&fit=crop&w=1000&q=80",
  },
  {
    label: "Chanderi",
    region: "Madhya Pradesh",
    image: "https://images.unsplash.com/photo-1602810319428-019690571b5b?auto=format&fit=crop&w=1000&q=80",
  },
  {
    label: "Bandhani",
    region: "Rajasthan & Gujarat",
    image: "https://images.unsplash.com/photo-1610189026049-a9f2097e8de7?auto=format&fit=crop&w=1000&q=80",
  },
  {
    label: "Pashmina",
    region: "Kashmir",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
  },
  {
    label: "Ikat",
    region: "Odisha & Telangana",
    image: "https://images.unsplash.com/photo-1602810318660-d2c46b750f0d?auto=format&fit=crop&w=1000&q=80",
  },
];

const heritageBanners = [
  {
    title: "Banarasi Sarees",
    subtitle: "Opulent zari drapes from Varanasi",
    image: "https://images.unsplash.com/photo-1602810319011-0d26d9dd6fd1?auto=format&fit=crop&w=1900&q=80",
    to: "/shop?tag=banarasi",
  },
  {
    title: "Pashmina Weaves",
    subtitle: "Feather-light warmth with Kashmiri grace",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1900&q=80",
    to: "/shop?tag=pashmina",
  },
];

const collections = [
  { title: "Regal Banarasi", subtitle: "Gold-threaded masterpieces", to: "/shop?tag=banarasi" },
  { title: "Festive Silk", subtitle: "Luminous drapes for celebrations", to: "/shop?tag=silk" },
  { title: "Modern Heirloom", subtitle: "Contemporary cuts, classic spirit", to: "/shop?tag=contemporary" },
];

const HomePage = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);

  useEffect(() => {
    const fetchNew = async () => {
      try {
        setLoadingNewArrivals(true);
        const data = await productApi.list({ limit: 8, ordering: "-created_at" });
        setNewArrivals(data?.results || data || []);
      } catch {
        setNewArrivals([]);
      } finally {
        setLoadingNewArrivals(false);
      }
    };
    fetchNew();
  }, []);

  return (
    <>
      <HeroBanner />

      <section className="section-container py-20">
        <SectionHeading
          eyebrow="Featured Collections"
          title="Signature Edits"
          description="Thoughtfully curated collections celebrating India’s textiles with timeless luxury."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {collections.map((collection, idx) => (
            <motion.article
              key={collection.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.1 }}
              className="luxury-card group p-8 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-raayaGold">Edition {idx + 1}</p>
              <h3 className="mt-3 font-serif text-2xl">{collection.title}</h3>
              <p className="mt-2 text-sm text-black/70">{collection.subtitle}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-raayaGold">Limited Collection • Only Few Pieces Left</p>
              <Link className="mt-6 inline-block text-sm uppercase tracking-[0.2em] text-raayaBlack underline-offset-4 hover:text-raayaGold hover:underline" to={collection.to}>
                Explore
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="space-y-8 py-6 md:py-10">
        {heritageBanners.map((banner, idx) => (
          <motion.div
            key={banner.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: idx * 0.1 }}
            className="relative h-[56vh] overflow-hidden md:h-[62vh]"
          >
            <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
            <div className="section-container absolute inset-0 flex items-end pb-10 md:items-center md:pb-0">
              <div className="max-w-2xl text-raayaIvory">
                <p className="text-xs uppercase tracking-[0.32em] text-raayaGold">Heritage Collection</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">{banner.title}</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-raayaIvory/85 md:text-base">{banner.subtitle}</p>
                <Link to={banner.to} className="mt-7 inline-block text-sm uppercase tracking-[0.2em] text-raayaIvory underline underline-offset-4 hover:text-raayaGold">
                  Explore Collection
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="section-container py-20">
        <SectionHeading eyebrow="Shop By Category" title="Indian Handloom Atlas" description="Placeholder visuals by weaving tradition. Swap each image with your final campaign asset while keeping the same structure." center />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, idx) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.08 }}
              className="group relative overflow-hidden border border-black/15"
            >
              <img src={category.image} alt={category.label} className="h-96 w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-raayaGold">{category.region}</p>
                <p className="mt-2 font-serif text-3xl text-raayaIvory">{category.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <WhyRaayaSection />
      <TrustBadges />

      <section className="section-container py-20">
        <SectionHeading eyebrow="New Arrivals" title="Just In" />
        {loadingNewArrivals ? (
          <div className="mt-8">
            <ProductGridSkeleton count={8} />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <InstagramGallery />
      <Testimonials />
    </>
  );
};

export default HomePage;
