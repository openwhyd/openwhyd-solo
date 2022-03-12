import { Playlist } from './Playlist';

/**
 * Hexagonal Architecture Domain API (primary ports)
 */
export interface Features {
  createPlaylist(
    userId: number,
    name: string,
    callback: (Playlist: Playlist) => void
  ): void;
}
