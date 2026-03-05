import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SkeletonCard = () => {
    return (
        <div className={cn(
            "glass-surface rounded-2xl p-6 flex flex-col h-full relative overflow-hidden",
            "border-slate-800/40"
        )}>
            {/* Category + Date */}
            <div className="flex justify-between items-start mb-4">
                <div className="skeleton-shimmer h-5 w-32 rounded-full" />
                <div className="skeleton-shimmer h-3 w-16 rounded" />
            </div>

            {/* Title */}
            <div className="skeleton-shimmer h-7 w-3/4 rounded-lg mb-3" />

            {/* Description */}
            <div className="space-y-2 mb-6 flex-grow">
                <div className="skeleton-shimmer h-4 w-full rounded" />
                <div className="skeleton-shimmer h-4 w-5/6 rounded" />
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-6">
                <div className="skeleton-shimmer h-5 w-14 rounded" />
                <div className="skeleton-shimmer h-5 w-12 rounded" />
                <div className="skeleton-shimmer h-5 w-16 rounded" />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                <div className="flex flex-col w-full">
                    <div className="skeleton-shimmer h-4 w-28 rounded-md mb-2" />
                    <div className="flex items-center gap-3">
                        <div className="skeleton-shimmer h-3.5 w-16 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};

