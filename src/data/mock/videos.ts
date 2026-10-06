import type { ID, Video, VideoCategory } from '@/models';
import { makeArt } from '../art';
import { audioTracks, daysAgo, slug, subtitleTracks, usage } from './builders';

/** [title, category, recordedAt, minutes, description, sharedWith] */
export type VideoSpec = [string, VideoCategory, string, number, string, string[]];

export function buildVideos(ownerId: ID, specs: VideoSpec[], idPrefix = 'vid', startDay = 1): Video[] {
  return specs.map(([title, category, recordedAt, minutes, description, sharedWith], i) => {
    const id = `${idPrefix}-${slug(title)}`;
    return {
      id,
      kind: 'video',
      title,
      description,
      year: Number(recordedAt.slice(0, 4)),
      addedAt: daysAgo(startDay + i * 5),
      ownerId,
      availability: 'available',
      ...usage(id),
      artwork: {
        thumb: makeArt('thumb', id, title, { label: false }),
        backdrop: makeArt('backdrop', id, title, { label: false }),
        poster: makeArt('poster', id, title),
      },
      durationSec: Math.round(minutes * 60),
      resolution: i % 3 === 0 ? '4K' : '1080p',
      hdr: false,
      audioTracks: audioTracks(id).slice(0, 1),
      subtitleTracks: subtitleTracks(id).slice(0, 0),
      category,
      recordedAt,
      sharedWithIds: sharedWith,
    };
  });
}

export const MY_VIDEOS: VideoSpec[] = [
  ["Emma's First Steps", 'Family', '2024-03-12', 3.7, 'Five wobbly steps across the living room rug.', []],
  ["Grandma's 80th Birthday", 'Family', '2023-08-19', 24, 'Three generations, one very large cake.', []],
  ['Christmas Morning 2025', 'Family', '2025-12-25', 12, 'Wrapping paper everywhere. Pure chaos.', []],
  ['Backyard Campout', 'Family', '2025-07-04', 9, 'Tent, fireflies, and marshmallows.', []],
  ['Lisbon Tram Rides', 'Travel', '2025-05-10', 6, 'Tram 28 at golden hour.', ['sarah']],
  ['Iceland Ring Road, Day 3', 'Travel', '2024-09-02', 14, 'Waterfalls and a very confident sheep.', ['sarah']],
  ['Kyoto in the Rain', 'Travel', '2023-11-08', 8, 'Temple gardens after a downpour.', []],
  ['Coastal Drive — Big Sur', 'Travel', '2022-06-21', 11, 'Highway 1 with the windows down.', ['alex']],
  ["Cousin Priya's Wedding Toast", 'Events', '2024-06-15', 7, 'The toast that made everyone cry (happily).', []],
  ['Neighborhood Block Party', 'Events', '2025-08-30', 18, 'Street closed, grills lit, kids everywhere.', []],
  ['Graduation Day', 'Events', '2023-05-27', 31, 'Caps in the air.', []],
  ['Studio Apartment Tour', 'Personal', '2024-01-09', 5, 'Before the furniture arrived.', []],
  ['Morning Run Timelapse', 'Personal', '2025-04-14', 2, 'Sunrise on the river trail.', []],
  ['Workshop Build Log #12', 'Other', '2025-10-02', 22, 'The bookshelf gets its doors.', []],
  ['Fireworks from the Roof', 'Other', '2025-07-04', 4, 'Best seats in the neighbourhood.', []],
];

export const FRIEND_VIDEOS: Record<string, VideoSpec[]> = {
  sarah: [
    ['Hiking the Ridge', 'Travel', '2025-06-14', 10, 'Sunrise above the cloud line.', []],
    ['Dog Park Chaos', 'Family', '2025-03-02', 5, 'Seven dogs, one frisbee.', []],
    ['Pottery Class Highlights', 'Other', '2025-09-12', 8, 'The wobbly vase saga.', []],
  ],
  david: [
    ['Road Trip Montage', 'Travel', '2025-08-01', 9, 'Four friends, one van.', []],
    ['Game Night Highlights', 'Events', '2025-02-20', 12, 'Betrayal, board games, bad snacks.', []],
  ],
};
