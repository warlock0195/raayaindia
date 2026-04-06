const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="luxury-card overflow-hidden">
          <div className="aspect-[3/4] animate-pulse bg-black/10" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-24 animate-pulse bg-black/10" />
            <div className="h-6 w-3/4 animate-pulse bg-black/10" />
            <div className="h-4 w-1/3 animate-pulse bg-black/10" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
