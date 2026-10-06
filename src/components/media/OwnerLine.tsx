import { Link } from 'react-router-dom';
import type { Friend } from '@/models';
import { Avatar, Badge } from '../ui';
import { paths } from '@/routes';

/** “Shared by Alex” — never shows where the file lives, only who shares it. */
export function OwnerLine({ owner }: { owner: Friend }) {
  return (
    <div className="row row--wrap">
      <Link to={paths.friend(owner.id)} className="owner-line" aria-label={`Shared by ${owner.name}. Open ${owner.name}'s library`}>
        <Avatar spec={owner.avatar} size="xs" presence={owner.presence} />
        Shared by {owner.name}
      </Link>
      <Badge tone="success" icon="shield" title="Shared titles can only be streamed">
        Stream only
      </Badge>
    </div>
  );
}
