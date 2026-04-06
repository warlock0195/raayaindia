import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { formatCurrency } from "../utils/formatters";

const fallbackImage =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80";

const ProductCard = ({ product }) => {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group luxury-card overflow-hidden"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
          <img
            src={product.images?.[0]?.image || fallbackImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.22em] text-raayaIvory/90">
            {product.category_name || "Heritage Edit"}
          </div>
        </div>
        <div className="space-y-2 p-4 md:p-5">
          <h3 className="line-clamp-2 font-serif text-xl leading-snug">{product.name}</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">{formatCurrency(product.discount_price || product.price)}</span>
            {product.discount_price ? (
              <span className="text-black/50 line-through">{formatCurrency(product.price)}</span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default ProductCard;
