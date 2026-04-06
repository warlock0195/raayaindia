const sizes = ["S", "M", "L", "XL"];
const colors = ["Red", "Ivory", "Black", "Gold", "Green"];

const FilterSidebar = ({ filters, setFilters }) => {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="luxury-card h-fit space-y-5 p-5">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-raayaGold">Category</p>
        <input
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
          className="w-full border border-black/20 bg-transparent px-3 py-2 text-sm outline-none"
          placeholder="Category ID"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-raayaGold">Min Price</p>
          <input
            type="number"
            value={filters.min_price}
            onChange={(e) => update("min_price", e.target.value)}
            className="w-full border border-black/20 bg-transparent px-3 py-2 text-sm outline-none"
            placeholder="0"
          />
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-raayaGold">Max Price</p>
          <input
            type="number"
            value={filters.max_price}
            onChange={(e) => update("max_price", e.target.value)}
            className="w-full border border-black/20 bg-transparent px-3 py-2 text-sm outline-none"
            placeholder="50000"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-raayaGold">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => update("size", filters.size === size ? "" : size)}
              className={`border px-3 py-1 text-xs ${filters.size === size ? "border-raayaGold text-raayaGold" : "border-black/20"}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-raayaGold">Color</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => update("color", filters.color === color ? "" : color)}
              className={`border px-3 py-1 text-xs ${
                filters.color === color ? "border-raayaGold text-raayaGold" : "border-black/20"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
