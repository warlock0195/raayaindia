import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "The craftsmanship is exceptional. Every weave carries grace and depth.",
    author: "Rhea Malhotra",
  },
  {
    quote: "Raaya blends heritage with modern silhouette better than any label I’ve worn.",
    author: "Aarohi Sharma",
  },
  {
    quote: "Luxury that feels deeply personal, rooted in Indian artistry.",
    author: "Meera Sood",
  },
];

const Testimonials = () => {
  return (
    <section className="section-container py-16">
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((item, idx) => (
          <motion.article
            key={item.author}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: idx * 0.1 }}
            className="luxury-card p-6"
          >
            <p className="font-serif text-xl leading-relaxed">“{item.quote}”</p>
            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-raayaGold">{item.author}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
