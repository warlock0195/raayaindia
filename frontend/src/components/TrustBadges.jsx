import { ShieldCheck, Sparkles, Truck } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "Bank-grade encrypted transactions for complete peace of mind.",
  },
  {
    icon: Truck,
    title: "Easy Returns",
    description: "Seamless returns and concierge support for every order.",
  },
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Hand-finished garments crafted with signature Raaya detailing.",
  },
];

const TrustBadges = () => {
  return (
    <section className="section-container py-12">
      <div className="grid gap-4 md:grid-cols-3">
        {badges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <motion.article
              key={badge.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.08 }}
              className="luxury-card flex items-start gap-4 p-5"
            >
              <Icon className="mt-0.5 text-raayaGold" size={20} />
              <div>
                <p className="text-xs uppercase tracking-[0.23em] text-raayaGold">{badge.title}</p>
                <p className="mt-2 text-sm text-black/70">{badge.description}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default TrustBadges;
