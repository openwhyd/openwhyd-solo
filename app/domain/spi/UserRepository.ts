import { Playlist } from '../Playlist';

export interface UserRepository {
  createPlaylist: CreatePlaylist;
}

export type CreatePlaylist = (
  uId: string,
  name: string,
  callback: (playlist: Playlist) => void
) => void;
