import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { homepageApi, productApi } from "../api/endpoints";
import InstagramGallery from "../components/InstagramGallery";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import Testimonials from "../components/Testimonials";
import TrustBadges from "../components/TrustBadges";
import WhyRaayaSection from "../components/WhyRaayaSection";

const fallbackImage =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80";

const HomePage = () => {
  const [heroBanner, setHeroBanner] = useState(null);
  const [sections, setSections] = useState([]);
  const [collections, setCollections] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const data = await homepageApi.content();
        setHeroBanner(data?.hero_banner || null);
        setSections(data?.sections || []);
        setCollections(data?.collections || []);
      } catch {
        setHeroBanner(null);
        setSections([]);
        setCollections([]);
      }
    };
    fetchCMS();
  }, []);

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
      <section className="relative min-h-[88vh] overflow-hidden">
        <img
          src={heroBanner?.image || fallbackImage}
          alt={heroBanner?.title || "Raaya India Hero"}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
        <div className="section-container relative grid min-h-[88vh] items-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-raayaIvory"
          >
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-raayaGold">Raaya India Atelier</p>
            <h1 className="font-serif text-4xl leading-[1.1] md:text-6xl">
              {heroBanner?.title || "Weaving India’s Heritage Into Modern Luxury"}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-raayaIvory/85 md:text-base">
              {heroBanner?.subtitle || "Discover handcrafted silhouettes inspired by regal traditions and refined for the modern muse."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={heroBanner?.button_link || "/shop"} className="raaya-button">
                {heroBanner?.button_text || "Shop Collection"}
              </Link>
              <Link to="/shop?sort=-created_at" className="raaya-outline-button border-raayaIvory text-raayaIvory hover:border-raayaGold">
                New Arrivals
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-container py-20">
        <SectionHeading
          eyebrow="Featured Collections"
          title="Signature Edits"
          description="Curated collections that can be managed directly from your admin CMS."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {collections.map((collection, idx) => (
            <motion.article
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.1 }}
              className="luxury-card group p-8 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-raayaGold">Edition {idx + 1}</p>
              <h3 className="mt-3 font-serif text-2xl">{collection.name}</h3>
              <p className="mt-2 text-sm text-black/70">{collection.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-raayaGold">Limited Collection • Only Few Pieces Left</p>
              <Link className="mt-6 inline-block text-sm uppercase tracking-[0.2em] text-raayaBlack underline-offset-4 hover:text-raayaGold hover:underline" to={`/shop?collection=${collection.id}`}>
                Explore
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="space-y-8 py-6 md:py-10">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: idx * 0.1 }}
            className="relative h-[56vh] overflow-hidden md:h-[62vh]"
          >
            <img src={section.image || fallbackImage} alt={section.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
            <div className="section-container absolute inset-0 flex items-end pb-10 md:items-center md:pb-0">
              <div className="max-w-2xl text-raayaIvory">
                <p className="text-xs uppercase tracking-[0.32em] text-raayaGold">{section.section_type}</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">{section.title}</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-raayaIvory/85 md:text-base">{section.subtitle}</p>
                <Link to={section.button_link || "/shop"} className="mt-7 inline-block text-sm uppercase tracking-[0.2em] text-raayaIvory underline underline-offset-4 hover:text-raayaGold">
                  {section.button_text || "Explore Collection"}
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
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
