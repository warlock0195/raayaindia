import { motion } from "framer-motion";

const pillars = [
  {
    title: "Premium Fabrics",
    description: "We source rich silks, organzas, and handloom blends chosen for depth, drape, and longevity.",
  },
  {
    title: "Authentic Craftsmanship",
    description: "Every silhouette is shaped by skilled Indian artisans preserving generational handcraft traditions.",
  },
  {
    title: "Timeless Designs",
    description: "Classic palettes and heirloom-worthy detailing ensure your wardrobe stays elegant season after season.",
  },
];

const WhyRaayaSection = () => {
  return (
    <section className="section-container py-16">
      <div className="luxury-card overflow-hidden md:grid md:grid-cols-[1.2fr_1fr]">
        <div className="bg-raayaBlack p-8 text-raayaIvory md:p-12">
          <p className="text-xs uppercase tracking-[0.35em] text-raayaGold">Why Raaya</p>
          <h3 className="mt-3 font-serif text-3xl md:text-4xl">Luxury That Feels Personal</h3>
          <p className="mt-5 max-w-xl text-sm text-raayaIvory/80 md:text-base">
            Raaya India is crafted for women who seek emotional connection in what they wear — where heritage, confidence,
            and refinement meet.
          </p>
          <div className="mt-7 inline-flex border border-raayaGold/50 px-4 py-2 text-xs uppercase tracking-[0.25em] text-raayaGold">
            Limited Collection • Only Few Pieces Left
          </div>
        </div>

        <div className="grid">
          {pillars.map((pillar, idx) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, x: 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.08 }}
              className="border-b border-black/10 p-6 last:border-b-0"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-raayaGold">0{idx + 1}</p>
              <h4 className="mt-2 font-serif text-2xl">{pillar.title}</h4>
              <p className="mt-2 text-sm text-black/70">{pillar.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyRaayaSection;
