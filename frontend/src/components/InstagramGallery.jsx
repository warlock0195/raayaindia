import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const shots = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1594736797933-d0f8f769b0f9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1610030469678-5f96cace35cf?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1610189026123-d7ea8c2f354d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1610030469730-8f8f5f4e33fa?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1610030469288-88b0f4457f7e?auto=format&fit=crop&w=900&q=80",
];

const InstagramGallery = () => {
  return (
    <section className="section-container py-16">
      <p className="mb-8 text-center text-xs uppercase tracking-[0.35em] text-raayaGold">@raayaindia</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {shots.map((shot, idx) => (
          <motion.div
            key={shot}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="aspect-square overflow-hidden"
          >
            <img src={shot} alt="Raaya Gallery" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
          </motion.div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link to="/shop" className="raaya-button">
          Shop from Instagram
        </Link>
      </div>
    </section>
  );
};

export default InstagramGallery;
