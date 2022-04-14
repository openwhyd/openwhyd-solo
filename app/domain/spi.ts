import { User, Playlist } from './types';

export type UserRepository = {
  fetchUserById: (id: string) => Promise<User>;
  insertPlaylist: (userId: string, playlist: Playlist) => Promise<void>;
};
