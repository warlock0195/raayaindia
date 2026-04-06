import { motion } from "framer-motion";

const SectionHeading = ({ eyebrow, title, description, center = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className={center ? "text-center" : ""}
    >
      {eyebrow ? <p className="mb-2 text-xs uppercase tracking-[0.35em] text-raayaGold">{eyebrow}</p> : null}
      <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 max-w-2xl text-sm text-black/70 md:text-base">{description}</p> : null}
    </motion.div>
  );
};

export default SectionHeading;
