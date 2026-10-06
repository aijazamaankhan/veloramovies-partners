import { useRef, type ReactNode } from 'react';
import type { AsyncState } from '@/hooks/useAsync';
import { useFocusOnMount } from '@/hooks/useFocusOnMount';
import { CatalogError } from '@/services/catalog';
import { ErrorState, RetryButton } from '../ui';

interface AsyncViewProps<T> {
  state: AsyncState<T> & { reload: () => void };
  skeleton: ReactNode;
  children: (data: T) => ReactNode;
  errorTitle?: string;
  /** Custom error screen (e.g. libraries that distinguish “offline” from “revoked”). */
  renderError?: (error: Error, reload: () => void) => ReactNode;
}

function Loaded({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusOnMount(ref);
  return (
    <div ref={ref} className="loaded">
      {children}
    </div>
  );
}

/** Renders the skeleton while loading, a friendly error on failure, and the page once data is ready. */
export function AsyncView<T>({ state, skeleton, children, errorTitle, renderError }: AsyncViewProps<T>) {
  if (state.status === 'loading') return <>{skeleton}</>;
  if (state.status === 'error') {
    if (renderError) return <>{renderError(state.error, state.reload)}</>;
    const code = state.error instanceof CatalogError ? state.error.code : 'library-error';
    return (
      <div className="page page--top">
        <ErrorState
          icon={code === 'not-found' ? 'search' : code === 'revoked' ? 'ban' : 'alert'}
          title={errorTitle ?? (code === 'not-found' ? "We couldn't find that" : state.error.message)}
          description={code === 'not-found' ? state.error.message : 'Something got in the way. Check that the owner is online and try again.'}
          action={<RetryButton onClick={state.reload} />}
        />
      </div>
    );
  }
  return <Loaded>{children(state.data)}</Loaded>;
}
