import { Playlist } from './types';

export type CreatePlaylist = (
  userId: number,
  playlistName: string
) => Promise<Playlist>;
