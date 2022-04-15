import type ObjectID from 'mongodb';

export type UserDocument = {
  _id: ObjectID;
  pl: { id: number | string; name: string }[];
};
