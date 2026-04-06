const SortBar = ({ sortBy, setSortBy }) => {
  return (
    <div className="luxury-card flex items-center justify-between p-4 text-sm">
      <p className="uppercase tracking-[0.2em] text-black/60">Curated Edit</p>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="border border-black/20 bg-transparent px-3 py-2 text-xs uppercase tracking-[0.2em] outline-none"
      >
        <option value="-created_at">Newest</option>
        <option value="price">Price: Low to High</option>
        <option value="-price">Price: High to Low</option>
      </select>
    </div>
  );
};

export default SortBar;
