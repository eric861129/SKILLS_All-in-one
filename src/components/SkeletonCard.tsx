export const SkeletonCard = () => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
            {/* Category + Date */}
            <div className="flex justify-between items-start mb-4">
                <div className="skeleton-shimmer h-5 w-36 rounded-full" />
                <div className="skeleton-shimmer h-4 w-20 rounded" />
            </div>

            {/* Title */}
            <div className="skeleton-shimmer h-6 w-3/4 rounded mb-3" />

            {/* Description */}
            <div className="space-y-2 mb-6 flex-grow">
                <div className="skeleton-shimmer h-4 w-full rounded" />
                <div className="skeleton-shimmer h-4 w-5/6 rounded" />
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-6">
                <div className="skeleton-shimmer h-5 w-20 rounded" />
                <div className="skeleton-shimmer h-5 w-16 rounded" />
                <div className="skeleton-shimmer h-5 w-24 rounded" />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="space-y-2">
                    <div className="skeleton-shimmer h-4 w-24 rounded" />
                    <div className="skeleton-shimmer h-3 w-12 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="skeleton-shimmer h-10 w-24 rounded-xl" />
                    <div className="skeleton-shimmer h-10 w-28 rounded-xl" />
                </div>
            </div>
        </div>
    );
};
