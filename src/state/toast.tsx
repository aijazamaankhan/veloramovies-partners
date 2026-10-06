import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastViewport, type ToastItem } from '@/components/ui/Toast';

interface ToastApi {
  show: (message: string, options?: { tone?: ToastItem['tone']; icon?: ToastItem['icon'] }) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const show = useCallback<ToastApi['show']>(
    (message, options) => {
      const id = nextId.current++;
      setItems((l) => [...l.slice(-2), { id, message, tone: options?.tone ?? 'default', icon: options?.icon }]);
      window.setTimeout(() => dismiss(id), 3600);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast must be used inside <ToastProvider>');
  return v;
}
