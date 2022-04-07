import { Playlist, User } from './types';

export type UserRepository = {
  insertPlaylist(userId: string, playlist: Playlist): Promise<Playlist>;
  getByUserId(userId: string): Promise<User>;
};
