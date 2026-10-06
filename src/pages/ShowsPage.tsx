import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import * as catalog from '@/services/catalog';
import { PosterBrowse } from './PosterBrowse';

export function ShowsPage() {
  useDocumentTitle('TV Shows');
  const state = useAsync(async () => {
    const { shows, featured } = await catalog.listShows();
    return { items: shows, featured };
  }, []);
  return <PosterBrowse state={state} kind="shows" />;
}
