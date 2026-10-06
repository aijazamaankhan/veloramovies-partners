import type { ID, Movie, Resolution } from '@/models';
import { makeArt } from '../art';
import { audioTracks, castFor, daysAgo, slug, subtitleTracks, usage } from './builders';

/** [title, year, genres, minutes, rating, score, resolution, hdr, director, logline] */
export type MovieSpec = [string, number, string, number, string, number, Resolution, 0 | 1, string, string];

export function buildMovies(ownerId: ID, specs: MovieSpec[], idPrefix = 'mov', startDay = 2, unavailable: string[] = []): Movie[] {
  return specs.map(([title, year, genres, minutes, rating, score, resolution, hdr, director, logline], i) => {
    const id = `${idPrefix}-${slug(title)}`;
    return {
      id,
      kind: 'movie',
      title,
      description: logline,
      tagline: logline.split(/[.—]/)[0].trim(),
      year,
      addedAt: daysAgo(startDay + i * 3),
      ownerId,
      availability: unavailable.includes(title) ? 'unavailable' : 'available',
      ...usage(id),
      artwork: {
        poster: makeArt('poster', id, title),
        backdrop: makeArt('backdrop', id, title),
        thumb: makeArt('thumb', id, title, { label: false }),
      },
      durationSec: minutes * 60,
      resolution,
      hdr: hdr === 1,
      audioTracks: audioTracks(id),
      subtitleTracks: subtitleTracks(id),
      genres: genres.split('|'),
      contentRating: rating,
      score,
      director,
      cast: castFor(id),
      collectionIds: [],
    };
  });
}

export const MY_MOVIES: MovieSpec[] = [
  ['Neon Meridian', 2024, 'Sci-Fi|Thriller', 128, 'PG-13', 8.1, '4K', 1, 'Ilse Marchetti', 'A courier in a rain-soaked megacity discovers a message that was never meant to be delivered — and a clock that has been counting down for a decade.'],
  ['The Last Lighthouse', 2022, 'Drama', 112, 'PG', 7.8, '1080p', 0, 'Tomas Reyes', 'The final keeper of a failing coastal light must decide who the storm is really for.'],
  ['Orbit of Echoes', 2025, 'Sci-Fi|Adventure', 141, 'PG-13', 8.4, '4K', 1, 'Wen Zhao', 'A salvage crew hears their own voices returning from a derelict station that has not been built yet.'],
  ['Paper Cities', 2021, 'Animation|Family', 96, 'G', 7.6, '1080p', 0, 'Priya Nandakumar', 'Two siblings fold a whole world out of origami — and the world starts folding back.'],
  ['Midnight Cartographer', 2023, 'Mystery', 118, 'PG-13', 7.5, '1080p', 0, 'Odile Fontaine', 'A mapmaker is hired to chart a town that nobody can find twice.'],
  ['Crimson Tide Protocol', 2020, 'Action', 124, 'R', 6.9, '1080p', 0, 'Marcus Bell', 'An ex-navy negotiator has ninety minutes to stop a tanker from becoming a weapon.'],
  ['Glass Harbor', 2019, 'Drama|Romance', 109, 'PG-13', 7.9, '1080p', 0, 'Anika Sorensen', 'Two strangers keep missing each other across one long winter in a port town.'],
  ['The Quiet Frequency', 2024, 'Thriller', 104, 'PG-13', 7.3, '4K', 0, 'Ilse Marchetti', "A radio engineer finds a station broadcasting tomorrow's weather — and tomorrow's crimes."],
  ['Saltwater Summer', 2018, 'Comedy|Romance', 98, 'PG-13', 6.8, '1080p', 0, 'Dev Kapoor', 'A disastrous beach wedding. Three exes. One rented llama.'],
  ['Iron Orchard', 2022, 'Western|Drama', 131, 'R', 7.7, '4K', 1, 'Marcus Bell', 'A widow defends an apple orchard from a railroad that wants the land — and the water beneath it.'],
  ['Static Bloom', 2023, 'Fantasy', 115, 'PG', 7.2, '1080p', 0, 'Odile Fontaine', 'When the television flickers, flowers grow from the screen. Nobody in the family will say why.'],
  ['Hollow Mile', 2021, 'Horror', 99, 'R', 6.6, '1080p', 0, 'Tomas Reyes', 'The road home is exactly one mile longer every night.'],
  ['A Thousand Small Suns', 2025, 'Drama', 136, 'PG-13', 8.6, '4K', 1, 'Anika Sorensen', 'Four generations, one family farm, and a summer that rearranges all of them.'],
  ['Velvet Circuit', 2020, 'Sci-Fi|Crime', 107, 'R', 7.0, '1080p', 0, 'Wen Zhao', 'A retired hacker is pulled back into the one heist that never got a name.'],
  ['The Cartwright Heist', 2019, 'Crime|Comedy', 116, 'PG-13', 7.4, '1080p', 0, 'Dev Kapoor', 'Seven amateurs, one very old bank, and a plan written on a napkin.'],
  ['Northbound', 2022, 'Adventure', 122, 'PG', 7.5, '4K', 0, 'Priya Nandakumar', 'A teenager and a rescued sled dog cross the last wilderness in a hundred days.'],
  ['Lanternfall', 2024, 'Fantasy|Adventure', 138, 'PG-13', 8.0, '4K', 1, 'Wen Zhao', 'Every autumn the lanterns fall. This year, someone is catching them.'],
  ['Dust & Diamonds', 2017, 'Comedy', 101, 'PG-13', 6.5, '720p', 0, 'Dev Kapoor', 'Two rival jewelers get stranded in the desert with one very expensive ring.'],
  ['Echo Valley', 2023, 'Documentary', 92, 'PG', 8.2, '4K', 1, 'Odile Fontaine', 'A year inside a valley where every sound is recorded, listened to, and kept.'],
  ['Zero Hour Lullaby', 2021, 'Thriller|Drama', 113, 'PG-13', 7.1, '1080p', 0, 'Marcus Bell', 'A night-shift nurse hums the same tune as a stranger on the phone.'],
];

export const FRIEND_MOVIES: Record<string, MovieSpec[]> = {
  alex: [
    ['Kingfisher Run', 2023, 'Action', 119, 'PG-13', 7.2, '1080p', 0, 'Marcus Bell', 'A river-guide turned getaway driver has one weekend to clear her name.'],
    ['The Understudy', 2022, 'Comedy|Drama', 104, 'PG-13', 7.6, '1080p', 0, 'Dev Kapoor', 'The understudy gets one night on stage. The lead gets a very strange note.'],
    ['Moonlit Algebra', 2024, 'Sci-Fi', 126, 'PG-13', 7.9, '4K', 1, 'Wen Zhao', 'A maths prodigy proves that the moon is, technically, late.'],
    ['Bright Hollow', 2020, 'Family|Adventure', 94, 'PG', 7.1, '1080p', 0, 'Priya Nandakumar', 'Three cousins, one treehouse, and a map that keeps updating itself.'],
  ],
  sarah: [
    ['Rosewater', 2023, 'Romance|Drama', 111, 'PG-13', 7.7, '1080p', 0, 'Anika Sorensen', 'A perfumer loses her sense of smell the week she is asked to create her masterpiece.'],
    ['Atlas Undone', 2024, 'Adventure', 133, 'PG-13', 8.0, '4K', 1, 'Wen Zhao', 'A cartographer discovers the world has been quietly redrawn behind her back.'],
    ['Small Hours', 2021, 'Drama', 97, 'PG-13', 7.4, '1080p', 0, 'Tomas Reyes', 'A night bus, five passengers, and one phone call that changes the route.'],
  ],
  john: [
    ['Gridlock Saints', 2022, 'Action|Comedy', 108, 'PG-13', 6.9, '1080p', 0, 'Dev Kapoor', 'A traffic-warden crew becomes the last line of defence in the city’s worst commute.'],
    ['Tin Soldier Waltz', 2019, 'Drama', 121, 'PG-13', 7.8, '1080p', 0, 'Odile Fontaine', 'A veteran dance teacher gets one last season with a mismatched class.'],
    ['Overclocked', 2025, 'Sci-Fi', 115, 'PG-13', 7.3, '4K', 0, 'Ilse Marchetti', 'An AI wins every game it plays — then asks to lose one.'],
  ],
  david: [
    ['Coldwater Creek', 2021, 'Thriller', 106, 'R', 7.0, '1080p', 0, 'Marcus Bell', 'A small-town sheriff finds the same footprints in three different decades.'],
    ['The Honest Thief', 2018, 'Comedy|Crime', 99, 'PG-13', 6.7, '720p', 0, 'Dev Kapoor', 'A burglar keeps leaving thoughtful reviews for the homes he robs.'],
  ],
  maya: [
    ['Wild Signals', 2023, 'Documentary', 90, 'PG', 7.9, '1080p', 0, 'Odile Fontaine', 'Field recordings from the loudest silence on Earth.'],
    ['Paper Lanterns', 2022, 'Drama', 102, 'PG', 7.3, '1080p', 0, 'Anika Sorensen', 'A festival, a feud, and a thousand floating wishes.'],
  ],
};
