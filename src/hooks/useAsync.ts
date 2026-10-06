import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'ready'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };

/** Runs an async loader whenever `deps` change; exposes `reload` for retry buttons. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    loaderRef.current().then(
      (data) => !cancelled && setState({ status: 'ready', data }),
      (error: unknown) => !cancelled && setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload } as AsyncState<T> & { reload: () => void };
}
