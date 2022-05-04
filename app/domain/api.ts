import { Playlist } from './types';

export type CreatePlaylist = (
  userId: string,
  playlistName: string
) => Promise<Playlist>;
