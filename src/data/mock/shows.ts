import type { Episode, ID, Resolution, TVShow } from '@/models';
import { makeArt } from '../art';
import { audioTracks, castFor, daysAgo, slug, subtitleTracks, usage } from './builders';

/** [title, startYear, genres, rating, score, creator, episodesPerSeason[], resolution, logline] */
export type ShowSpec = [string, number, string, string, number, string, number[], Resolution, string];

const EPISODE_TITLES = [
  'Pilot', 'The Long Way Round', 'Cold Open', 'Static', 'Borrowed Time', 'Low Tide', 'Understudy', 'Signal Lost',
  'The Quiet Room', 'Afterglow', 'Paper Trail', 'Red Eye', 'Safe House', 'Daybreak', 'Open Water', 'Residue',
  'Second Shift', 'The Ledger', 'Blackout', 'Homecoming', 'Kintsugi', 'Slow Burn', 'Parallax', 'The Long Night',
  'Orbit', 'Weather Report', 'Terminus', 'Half-Light', 'Overtime', 'The Last Light', 'Fault Lines', 'Small Talk',
  'No Signal', 'Dry Season', 'Hard Reset', 'Good Neighbours', 'Rewind', 'The Understudy', 'Landfall', 'Last Call',
];

const EPISODE_BLURBS = [
  'A decision made in haste starts to cost more than anyone expected.',
  'Old loyalties are tested when a familiar face returns with a request.',
  'The team follows a lead that turns out to be much closer to home.',
  'A quiet night is interrupted by news that changes the plan.',
  'Secrets surface as the weather turns and the roads close.',
  'An unlikely alliance forms over a shared problem.',
  'Someone is not who they claimed to be — and time is short.',
  'A flashback reveals why nobody talks about that summer.',
  'The fallout from last week spills into everyone’s routine.',
  'A small mistake becomes a very large problem.',
  'Two worlds collide over a misunderstanding.',
  'The truth is finally out. Not everyone is happy about it.',
];

export function buildShows(ownerId: ID, specs: ShowSpec[], idPrefix = 'show', startDay = 4, titleOffset = 0): { shows: TVShow[]; episodes: Episode[] } {
  const shows: TVShow[] = [];
  const episodes: Episode[] = [];
  let counter = titleOffset;

  specs.forEach(([title, year, genres, rating, score, creator, perSeason, resolution, logline], si) => {
    const id = `${idPrefix}-${slug(title)}`;
    const isComedy = genres.includes('Comedy');
    const seasons = perSeason.map((count, sIdx) => {
      const episodeIds: ID[] = [];
      for (let e = 1; e <= count; e++) {
        const epId = `${id}-s${sIdx + 1}e${e}`;
        const epTitle = EPISODE_TITLES[counter % EPISODE_TITLES.length];
        const minutes = isComedy ? 22 + ((counter * 3) % 8) : 42 + ((counter * 5) % 16);
        episodes.push({
          id: epId,
          kind: 'episode',
          showId: id,
          seasonNumber: sIdx + 1,
          episodeNumber: e,
          title: epTitle,
          description: EPISODE_BLURBS[(counter + si) % EPISODE_BLURBS.length],
          year: year + sIdx,
          addedAt: daysAgo(startDay + si * 4),
          ownerId,
          availability: 'available',
          ...usage(epId),
          artwork: { thumb: makeArt('thumb', epId, epTitle, { label: false }), backdrop: makeArt('backdrop', epId, epTitle, { label: false }) },
          durationSec: minutes * 60,
          resolution,
          hdr: false,
          audioTracks: audioTracks(epId),
          subtitleTracks: subtitleTracks(epId),
        });
        episodeIds.push(epId);
        counter++;
      }
      return { number: sIdx + 1, title: `Season ${sIdx + 1}`, episodeIds };
    });

    shows.push({
      id,
      kind: 'show',
      title,
      description: logline,
      year,
      addedAt: daysAgo(startDay + si * 4),
      ownerId,
      availability: 'available',
      ...usage(id),
      artwork: {
        poster: makeArt('poster', id, title),
        backdrop: makeArt('backdrop', id, title),
        thumb: makeArt('thumb', id, title, { label: false }),
      },
      genres: genres.split('|'),
      contentRating: rating,
      score,
      creator,
      cast: castFor(id),
      resolution,
      hdr: false,
      seasons,
    });
  });
  return { shows, episodes };
}

export const MY_SHOWS: ShowSpec[] = [
  ['Breaking Example', 2021, 'Crime|Drama', 'TV-MA', 9.0, 'Vince Gilmore', [4, 3], '4K', 'A mild-mannered teacher discovers a talent for something illegal — and an even bigger talent for explaining it.'],
  ['The Signal Room', 2023, 'Sci-Fi|Mystery', 'TV-14', 8.3, 'Aiko Brandt', [4], '1080p', 'Six analysts in a windowless room decode a transmission that keeps decoding them back.'],
  ['Harbor Lights', 2020, 'Drama', 'TV-PG', 7.9, 'Nora Whitlock', [3], '1080p', 'The people of a fading port town fight to keep the lights on — literally and otherwise.'],
  ["Chef's Table of Mars", 2024, 'Comedy|Sci-Fi', 'TV-14', 7.8, 'Rafael Quist', [3], '1080p', 'The first restaurant on Mars has one critic, three suppliers, and no oxygen budget for mistakes.'],
  ['Deep Field', 2022, 'Documentary', 'TV-G', 8.7, 'Dr. Lena Okafor', [3], '4K', 'A patient, beautiful tour of the farthest things we have ever photographed.'],
  ['Ashfall', 2023, 'Thriller', 'TV-MA', 8.1, 'Jules Marchand', [4], '4K', 'After the eruption, a rescue team discovers that not everyone wants to be found.'],
  ['Kingdom of Moss', 2025, 'Fantasy', 'TV-PG', 8.0, 'Elodie Rask', [3], '4K', 'A tiny court of forest folk goes to war over a single dry stone.'],
  ['Night Shift Diaries', 2021, 'Comedy|Drama', 'TV-14', 7.6, 'Cass Delaney', [3], '1080p', 'Five coworkers, one 24-hour diner, and the strangest customers in the county.'],
];

export const FRIEND_SHOWS: Record<string, ShowSpec[]> = {
  alex: [
    ['Parallel Lines', 2022, 'Sci-Fi|Drama', 'TV-14', 8.2, 'Wen Zhao', [3, 2], '1080p', 'Two commuters realise they are riding the same train through different realities.'],
    ['Dockside', 2020, 'Drama', 'TV-14', 7.5, 'Sam Ortega', [2], '1080p', 'Shift workers on the busiest quay in the country.'],
  ],
  sarah: [['The Bake-Off Files', 2023, 'Comedy|Reality', 'TV-G', 7.7, 'Hollis June', [3], '1080p', 'Behind the scenes of the most polite competition in the world.']],
  david: [['Midway Station', 2021, 'Sci-Fi|Thriller', 'TV-14', 7.9, 'Jules Marchand', [2], '1080p', 'A space station halfway between everywhere and nowhere.']],
};
