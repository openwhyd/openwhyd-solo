import { Playlist, User } from './types';

export type UserRepository = {
  createPlaylist(
    userId: string,
    playlistName: string,
    callback: (playlist: Playlist) => void
  ): void;
  getByUserId(userId: string): Promise<User>;
};
