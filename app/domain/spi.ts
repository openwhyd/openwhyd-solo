import { Playlist } from './types';

export type UserRepository = {
  createPlaylist(
    userId: number,
    playlistName: string,
    callback: (playlist: Playlist) => void
  ): void;
};
