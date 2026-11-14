export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    durationMs?: number;
}

type ToastListener = (toasts: ToastMessage[]) => void;

class ToastManager {
    private toasts: ToastMessage[] = [];
    private listeners: Set<ToastListener> = new Set();

    subscribe(listener: ToastListener): () => void {
        this.listeners.add(listener);
        listener(this.toasts);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private emit(): void {
        this.listeners.forEach((listener) => {
            try {
                listener([...this.toasts]);
            } catch (err) {
                console.error('Toast listener notification failed:', err);
            }
        });
    }

    notify(message: string, type: ToastType = 'info', durationMs = 5000): string {
        if (!message || typeof message !== 'string') return '';

        const trimmed = message.trim();
        if (!trimmed) return '';

        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const toastItem: ToastMessage = {
            id,
            type,
            message: trimmed,
            durationMs,
        };

        // Prepend new toast, keep at most 4 active toasts
        this.toasts = [toastItem, ...this.toasts].slice(0, 4);
        this.emit();

        if (durationMs > 0) {
            setTimeout(() => {
                this.dismiss(id);
            }, durationMs);
        }

        return id;
    }

    dismiss(id: string): void {
        const next = this.toasts.filter((t) => t.id !== id);
        if (next.length !== this.toasts.length) {
            this.toasts = next;
            this.emit();
        }
    }

    clear(): void {
        this.toasts = [];
        this.emit();
    }

    success(message: string, durationMs = 4000): string {
        return this.notify(message, 'success', durationMs);
    }

    error(message: string, durationMs = 6000): string {
        return this.notify(message, 'error', durationMs);
    }

    warning(message: string, durationMs = 5000): string {
        return this.notify(message, 'warning', durationMs);
    }

    info(message: string, durationMs = 4000): string {
        return this.notify(message, 'info', durationMs);
    }
}

export const toast = new ToastManager();

