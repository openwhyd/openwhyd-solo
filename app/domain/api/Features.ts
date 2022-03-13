import { Playlist } from '../Playlist';

/**
 * Hexagonal Architecture Domain API (primary ports)
 */
export interface Features {
  createPlaylist: CreatePlaylist;
}

export type CreatePlaylist = (
  userId: string,
  playlistName: string
) => Promise<Playlist>;
