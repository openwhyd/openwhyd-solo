import { Playlist, User } from './types';

export type UserRepository = {
  insertPlaylist(userId: string, playlistName: string): Promise<Playlist>;
  getByUserId(userId: string): Promise<User>;
};
