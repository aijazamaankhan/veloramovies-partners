import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import * as catalog from '@/services/catalog';
import { PosterBrowse } from './PosterBrowse';

export function MoviesPage() {
  useDocumentTitle('Movies');
  const state = useAsync(async () => {
    const { movies, featured } = await catalog.listMovies();
    return { items: movies, featured };
  }, []);
  return <PosterBrowse state={state} kind="movies" />;
}
