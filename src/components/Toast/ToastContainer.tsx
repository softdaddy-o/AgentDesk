import { useToastStore } from '../../stores/toastStore';

export default function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);
    const removeToast = useToastStore((s) => s.removeToast);

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close">&times;</button>
                </div>
            ))}
        </div>
    );
}
