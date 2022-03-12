import { Playlist } from '../Playlist';

export interface UserRepository {
  createPlaylist: CreatePlaylist;
}

export type CreatePlaylist = (
  userId: number,
  playlistName: string,
  callback: (Playlist: Playlist) => void
) => void;
