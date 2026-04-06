const QuantitySelector = ({ value, onChange, min = 1 }) => {
  return (
    <div className="inline-flex items-center border border-black/20">
      <button
        type="button"
        className="px-3 py-2"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        -
      </button>
      <span className="w-10 text-center text-sm">{value}</span>
      <button type="button" className="px-3 py-2" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
