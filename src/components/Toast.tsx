import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
            default: return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
        }
    };

    const getAccent = (type: ToastType) => {
        switch (type) {
            case 'success': return 'bg-emerald-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-[slideIn_var(--duration-normal)_var(--ease-spring)]"
                        style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                        <div className="flex items-center gap-3 px-4 py-3">
                            {getIcon(toast.type)}
                            <span className="text-sm text-slate-200 font-medium flex-1">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        {/* Countdown progress bar */}
                        <div className={`h-0.5 ${getAccent(toast.type)} toast-progress`} />
                    </div>
                ))}
            </div>

            {/* Inline keyframes for slide-in */}
            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
        </ToastContext.Provider>
    );
};
