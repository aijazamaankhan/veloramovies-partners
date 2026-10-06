import type { Album, Artist, ID, Playlist, Song } from '@/models';
import { makeArt } from '../art';
import { daysAgo, pick, slug, usage } from './builders';

/** [title, artist, year, genres, trackCount] */
export type AlbumSpec = [string, string, number, string, number];

const SONG_TITLES = [
  'Midnight Transit', 'Paper Moons', 'Afterimage', 'Golden Hour', 'Static Hearts', 'Low Tide', 'Neon Gospel', 'Slow Orbit',
  'Heliotrope', 'Quiet Thunder', 'Blue Hour', 'Satellite', 'Glass Cathedral', 'Sunday Tapes', 'Concrete Garden', 'Velvet',
  'Wild Orchid', 'Skyline', 'Radio Saints', 'Deep Blue Room', 'Echoes of You', 'Lantern Light', 'Northern Lights', 'Falling Upward',
  'Honey & Smoke', 'Parallel Roads', 'Late Bloom', 'Weightless', 'Signal Fire', 'Coastline', 'Pocket Universe', 'The Long Way Home',
  'Dandelion', 'Overpass', 'Embers', 'After the Rain', 'Rooftop Season', 'Silver Linings', 'Back Seat Stars', 'Daydream Machine',
  'Tidal', 'Wake Me Up Slowly', 'Cassette Summer', 'Open Windows', 'Gravity Wells', 'Moon Dial', 'Fever Dream', 'Soft Static',
  'Roman Candles', 'Winter Light', 'Safe Harbor', 'Kaleidoscope', 'Evergreen', 'Late Night Diner', 'Paper Planes', 'Violet Hour',
  'Runaway Train', 'Salt & Sugar', 'Compass Rose', 'Hush', 'Afterglow Avenue', 'Sleepwalking', 'Mirrorball', 'Backroads',
  'Lowlight', 'Honeycomb', 'Dim the Sun', 'Spare Change', 'Starlings', 'Coda',
];

function songDuration(id: string): number {
  return 150 + (id.length * 37 + id.charCodeAt(id.length - 1) * 11) % 140;
}

export function buildMusic(ownerId: ID, specs: AlbumSpec[], idPrefix: string, songOffset: number, startDay = 3) {
  const albums: Album[] = [];
  const songs: Song[] = [];
  const artists = new Map<string, Artist>();
  let sCount = songOffset;

  specs.forEach(([title, artistName, year, genres, trackCount], i) => {
    const id = `${idPrefix}-${slug(title)}`;
    const artistId = `${idPrefix}-artist-${slug(artistName)}`;
    const art = makeArt('square', id, title);
    const trackIds: ID[] = [];
    let total = 0;
    for (let t = 1; t <= trackCount; t++) {
      const songTitle = SONG_TITLES[sCount % SONG_TITLES.length];
      const sid = `${idPrefix}-song-${slug(songTitle)}-${sCount}`;
      const dur = songDuration(sid);
      total += dur;
      songs.push({
        id: sid,
        kind: 'song',
        title: songTitle,
        description: `${songTitle} — from ${title}`,
        year,
        addedAt: daysAgo(startDay + i * 2),
        ownerId,
        availability: 'available',
        ...usage(sid),
        artwork: { square: art },
        albumId: id,
        albumTitle: title,
        artistId,
        artistName,
        trackNumber: t,
        durationSec: dur,
      });
      trackIds.push(sid);
      sCount++;
    }
    albums.push({
      id,
      kind: 'album',
      title,
      description: `${title} by ${artistName}`,
      year,
      addedAt: daysAgo(startDay + i * 2),
      ownerId,
      availability: 'available',
      ...usage(id),
      artwork: { square: art },
      artistId,
      artistName,
      genres: genres.split('|'),
      trackIds,
      totalDurationSec: total,
    });
    const existing = artists.get(artistId);
    if (existing) existing.albumIds.push(id);
    else artists.set(artistId, { id: artistId, name: artistName, ownerId, albumIds: [id], artwork: { square: makeArt('square', artistId, artistName, { label: false }) } });
  });
  return { albums, songs, artists: [...artists.values()] };
}

export const MY_ALBUMS: AlbumSpec[] = [
  ['Midnight Transit', 'Luna Vale', 2024, 'Synthwave', 3],
  ['Golden Hour Static', 'Luna Vale', 2022, 'Dream Pop', 3],
  ['Paper Moons', 'The Harbor Kids', 2023, 'Indie', 3],
  ['Low Tide Letters', 'The Harbor Kids', 2020, 'Indie Folk', 3],
  ['Afterimage', 'Kaito Sato', 2025, 'Electronic', 3],
  ['Concrete Garden', 'Mira Okafor', 2021, 'Neo-Soul', 3],
  ['Velvet Static', 'Mira Okafor', 2024, 'R&B', 3],
  ['Wild Orchid Hours', 'Rowan & the Pines', 2019, 'Folk', 3],
  ['Skyline Lullabies', 'Nova Reyes', 2023, 'Pop', 3],
  ['Radio Saints', 'Echo Parade', 2022, 'Rock', 3],
  ['Glass Cathedral', 'Echo Parade', 2025, 'Alternative', 2],
  ['Sunday Tapes', 'Dune Collective', 2021, 'Lo-fi', 2],
  ['Deep Blue Room', 'Dune Collective', 2024, 'Ambient', 2],
  ['Neon Gospel', 'Kaito Sato', 2022, 'Electronic', 2],
  ['Heliotrope', 'Nova Reyes', 2025, 'Pop', 2],
  ['The Long Afternoon', 'Rowan & the Pines', 2023, 'Folk', 2],
  ['Satellite Hearts', 'Cassidy Lane', 2020, 'Country', 2],
  ['Blue Hour', 'Cassidy Lane', 2024, 'Country Pop', 2],
  ['Quiet Thunder', 'Oren Adler', 2021, 'Jazz', 2],
  ['Midnight at the Observatory', 'Oren Adler', 2023, 'Jazz', 2],
];

export const FRIEND_ALBUMS: Record<string, AlbumSpec[]> = {
  alex: [
    ['Harbor Echoes', 'Marlowe Grey', 2023, 'Indie', 2],
    ['Tidewater', 'Marlowe Grey', 2021, 'Indie Folk', 2],
  ],
  sarah: [
    ['Kitchen Table Sessions', 'Hollis June', 2024, 'Folk', 2],
    ['Sunroom', 'Hollis June', 2022, 'Folk Pop', 2],
    ['Pocket Universe', 'The Lanterns', 2023, 'Indie', 2],
  ],
  john: [
    ['Overdrive', 'Static Kings', 2022, 'Rock', 2],
    ['Garage Hymns', 'Static Kings', 2019, 'Rock', 2],
  ],
  david: [['Night Bus', 'Pale Violet', 2024, 'Dream Pop', 2]],
};

export function buildPlaylists(ownerId: ID, songs: Song[]): Playlist[] {
  const defs: [string, string][] = [
    ['Late Night Drive', 'Neon, bass and an empty highway.'],
    ['Focus Flow', 'Instrumental and ambient for deep work.'],
    ['Sunday Morning', 'Slow coffee, softer songs.'],
    ['Workout Pulse', 'Up-tempo energy from your library.'],
    ['Road Trip Classics', 'Windows down, volume up.'],
    ['Rainy Day', 'For grey skies and warm blankets.'],
  ];
  return defs.map(([name, description], i) => {
    const id = `pl-${slug(name)}`;
    return {
      id,
      name,
      description,
      ownerId,
      songIds: pick(songs, id, 8 + (i % 4)).map((s) => s.id),
      artwork: { square: makeArt('square', id, name) },
    };
  });
}
