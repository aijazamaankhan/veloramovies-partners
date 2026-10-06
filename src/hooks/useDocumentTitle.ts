import { useEffect } from 'react';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · VibeVault` : 'VibeVault — your private media network';
  }, [title]);
}
