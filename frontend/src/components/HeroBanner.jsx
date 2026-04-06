import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const heroImage =
  "https://images.unsplash.com/photo-1610030469668-8c2f68d77680?auto=format&fit=crop&w=1700&q=80";

const heroAccentImage =
  "https://images.unsplash.com/photo-1610189026049-a9f2097e8de7?auto=format&fit=crop&w=1100&q=80";

const HeroBanner = () => {
  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <img src={heroImage} alt="Raaya India Hero" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-raaya-glow opacity-80" />

      <div className="section-container relative grid min-h-[88vh] items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-raayaIvory"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-raayaGold">Raaya India Atelier</p>
          <h1 className="font-serif text-4xl leading-[1.1] md:text-6xl">Weaving India’s Heritage Into Modern Luxury</h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-raayaIvory/85 md:text-base">
            Discover handcrafted silhouettes inspired by regal traditions and refined for the modern muse.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop" className="raaya-button">
              Shop Collection
            </Link>
            <Link to="/shop?sort=-created_at" className="raaya-outline-button border-raayaIvory text-raayaIvory hover:border-raayaGold">
              New Arrivals
            </Link>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.22em] text-raayaIvory/80"
          >
            <span>Handloom-crafted</span>
            <span>Small-batch edits</span>
            <span>Pan-India shipping</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="hidden justify-self-end border border-raayaGold/50 bg-black/25 p-3 backdrop-blur-sm lg:block"
        >
          <img
            src={heroAccentImage}
            alt="Indian handloom texture detail"
            className="h-[420px] w-[320px] object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="mt-3 flex items-center justify-between px-1 text-xs uppercase tracking-[0.2em] text-raayaIvory/80">
            <span>Artisan Edit</span>
            <span>Since 2024</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
