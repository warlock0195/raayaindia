import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { productApi } from "../api/endpoints";
import FilterSidebar from "../components/FilterSidebar";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import SectionHeading from "../components/SectionHeading";
import SortBar from "../components/SortBar";

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("-created_at");
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    category: "",
    min_price: "",
    max_price: "",
    size: "",
    color: "",
  });

  const params = useMemo(
    () => ({
      ...filters,
      search,
      ordering: sortBy,
      limit: 12,
      offset: (page - 1) * 12,
    }),
    [filters, search, sortBy, page]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.list(params);
        setProducts(data?.results || data || []);
        setTotal(data?.count || (Array.isArray(data) ? data.length : 0));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params]);

  const totalPages = Math.max(1, Math.ceil(total / 12));

  return (
    <div className="section-container py-10 md:py-14">
      <SectionHeading
        eyebrow="Raaya Edit"
        title="Luxury Ethnic Collection"
        description="Curated sarees, kurtas, lehengas and handcrafted silhouettes for every celebration."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <FilterSidebar filters={filters} setFilters={setFilters} />

        <div className="space-y-4">
          <div className="luxury-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full border border-black/20 bg-transparent px-3 py-2 text-sm outline-none sm:max-w-sm"
              placeholder="Search by name, tags or description"
            />
            <SortBar sortBy={sortBy} setSortBy={setSortBy} />
          </div>

          {loading ? (
            <div className="py-3">
              <ProductGridSkeleton count={8} />
            </div>
          ) : (
            <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}

          <div className="flex items-center justify-between border-t border-black/10 pt-4 text-sm">
            <button
              className="raaya-outline-button px-4 py-2 text-xs"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </button>
            <p className="uppercase tracking-[0.2em] text-black/70">
              Page {page} / {totalPages}
            </p>
            <button
              className="raaya-outline-button px-4 py-2 text-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
