import { Playlist, User } from '../user/types';

export interface UserRepository {
  getByUserId: GetByUserId;
  save: Save;
}

export type GetByUserId = (userId: string) => Promise<User>;
export type Save = (user: User) => Promise<User>;
