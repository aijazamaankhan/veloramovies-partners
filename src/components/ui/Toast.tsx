import { Icon, type IconName } from './Icon';

export interface ToastItem {
  id: number;
  message: string;
  tone: 'default' | 'success' | 'danger';
  icon?: IconName;
}

export function ToastViewport({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`}>
          <Icon name={t.icon ?? (t.tone === 'success' ? 'check' : t.tone === 'danger' ? 'alert' : 'info')} />
          <span>{t.message}</span>
          <button type="button" className="toast__close" aria-label="Dismiss notification" onClick={() => onDismiss(t.id)} data-nav-skip>
            <Icon name="close" size="1em" />
          </button>
        </div>
      ))}
    </div>
  );
}
