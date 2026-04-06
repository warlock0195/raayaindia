import { motion } from "framer-motion";

import SectionHeading from "../components/SectionHeading";

const AboutPage = () => {
  return (
    <div className="pb-12">
      <section className="relative h-[62vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1610030469886-f9282fd90813?auto=format&fit=crop&w=1700&q=80"
          alt="Raaya Story"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="section-container relative flex h-full items-end pb-12">
          <div className="max-w-3xl text-raayaIvory">
            <p className="text-xs uppercase tracking-[0.35em] text-raayaGold">About Raaya</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">A House of Indian Luxury, Woven with Soul</h1>
          </div>
        </div>
      </section>

      <section className="section-container py-16">
        <SectionHeading
          eyebrow="Brand Story"
          title="Where Heritage Becomes Modern Heirloom"
          description="Raaya India was born from a deep reverence for India’s handloom legacy — from the glow of Banarasi silk to the poetry of artisanal embroidery."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <p className="text-base leading-relaxed text-black/75">
            We believe luxury is not loud. It is emotional, intentional, and deeply rooted in craft. Every collection is designed
            to celebrate the woman who carries culture with grace and confidence.
          </p>
          <p className="text-base leading-relaxed text-black/75">
            Our ateliers collaborate with master artisans across India, preserving rare techniques while shaping silhouettes for contemporary
            lifestyles. Each Raaya piece is meant to be worn, remembered, and passed forward.
          </p>
        </div>
      </section>

      <section className="section-container grid gap-6 py-8 lg:grid-cols-2">
        <motion.img
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          src="https://images.unsplash.com/photo-1610189025912-3606ebed9602?auto=format&fit=crop&w=1200&q=80"
          alt="Founder Vision"
          className="h-[420px] w-full object-cover"
        />
        <div className="luxury-card p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-raayaGold">Founder Vision</p>
          <h2 className="mt-3 font-serif text-3xl">To Place Indian Craft on the Global Luxury Stage</h2>
          <p className="mt-5 text-base leading-relaxed text-black/75">
            Raaya’s vision is to build an enduring Indian luxury label that feels globally refined yet emotionally rooted in home.
            Our founder imagined a brand where each ensemble carries narrative depth — of heritage, femininity, and quiet power.
          </p>
        </div>
      </section>

      <section className="section-container grid gap-6 py-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="luxury-card p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-raayaGold">Craftsmanship</p>
          <h2 className="mt-3 font-serif text-3xl">Handmade. Authentic. Rare.</h2>
          <ul className="mt-6 space-y-3 text-sm text-black/75">
            <li>• Hand-finished detailing by specialized artisans</li>
            <li>• Limited-run styles to preserve exclusivity</li>
            <li>• Premium natural fabrics chosen for richness and longevity</li>
            <li>• Rigorous quality checks for couture-level finish</li>
          </ul>
        </div>
        <motion.img
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          src="https://images.unsplash.com/photo-1594736797933-d0f8f769b0f9?auto=format&fit=crop&w=1200&q=80"
          alt="Craftsmanship"
          className="h-[420px] w-full object-cover"
        />
      </section>
    </div>
  );
};

export default AboutPage;
