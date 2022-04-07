import { ObjectID } from 'mongodb';

export type UserDocument = {
  _id: ObjectID;
  pl: { id: string | number; name: string }[];
};
