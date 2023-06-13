// service providing interface

import { Playlist, User } from './types';

export type UserRepository = {
  getUserById(userId: string): Promise<User>;
  insertPlaylist(userId: string, playlist: Playlist): Promise<void>;
};
