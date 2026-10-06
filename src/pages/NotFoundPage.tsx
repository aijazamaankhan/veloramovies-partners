import { ErrorState, LinkButton } from '@/components/ui';
import { paths } from '@/routes';

export function NotFoundPage() {
  return (
    <div className="page page--top">
      <ErrorState icon="search" title="We can't find that page" description="The link may be old, or the title may have been removed." action={<LinkButton variant="primary" to={paths.home} icon="home" data-autofocus>Go home</LinkButton>} />
    </div>
  );
}
