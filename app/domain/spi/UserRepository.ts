import { Playlist } from '../Playlist';

export interface UserRepository {
  createPlaylist(
    userId: number,
    playlistName: string,
    callback: (Playlist: Playlist) => void
  ): void;
}

export type CreatePlaylist = (
  userId: number,
  playlistName: string,
  callback: (Playlist: Playlist) => void
) => void;
