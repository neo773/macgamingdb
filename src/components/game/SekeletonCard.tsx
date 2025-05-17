export function GameCardSkeleton() {
  return (
    <div className="relative">
      <div className="aspect-[460/215] rounded-xl overflow-hidden bg-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="h-5 bg-gray-700 rounded animate-pulse w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded animate-pulse w-1/3"></div>
      </div>
    </div>
  );
}
