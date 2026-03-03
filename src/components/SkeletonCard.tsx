export const SkeletonCard = () => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse flex flex-col h-full">
            {/* Category + Date */}
            <div className="flex justify-between items-start mb-4">
                <div className="h-5 w-32 bg-slate-800 rounded-full" />
                <div className="h-4 w-20 bg-slate-800 rounded" />
            </div>

            {/* Title */}
            <div className="h-6 w-3/4 bg-slate-800 rounded mb-2" />

            {/* Description */}
            <div className="space-y-2 mb-6 flex-grow">
                <div className="h-4 w-full bg-slate-800 rounded" />
                <div className="h-4 w-5/6 bg-slate-800 rounded" />
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-6">
                <div className="h-5 w-16 bg-slate-800 rounded" />
                <div className="h-5 w-20 bg-slate-800 rounded" />
                <div className="h-5 w-14 bg-slate-800 rounded" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-800 rounded" />
                    <div className="h-3 w-16 bg-slate-800 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-20 bg-slate-800 rounded-xl" />
                    <div className="h-10 w-24 bg-slate-800 rounded-xl" />
                </div>
            </div>
        </div>
    );
};
