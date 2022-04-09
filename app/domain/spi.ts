import { Playlist, User } from './types';

export type UserRepository = {
  getByUserId: (userId: string) => Promise<User>;
  insertPlaylist: (userId: string, playlist: Playlist) => Promise<void>;
};
