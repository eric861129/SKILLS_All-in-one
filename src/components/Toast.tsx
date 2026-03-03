import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = nextId++;
        setToasts(prev => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: ToastItem; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 3500);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? XCircle : AlertCircle;
    const colors = toast.type === 'success'
        ? 'border-emerald-500/30 text-emerald-400'
        : toast.type === 'error'
            ? 'border-red-500/30 text-red-400'
            : 'border-blue-500/30 text-blue-400';

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 bg-slate-900/95 backdrop-blur-xl border ${colors} px-5 py-3.5 rounded-xl shadow-2xl animate-in slide-in-from-right-5 fade-in duration-300 min-w-[280px]`}
        >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium text-slate-200 flex-1">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
