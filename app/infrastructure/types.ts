import { mongodb } from 'mongodb';

export type UserDocument = {
  _id: mongodb.ObjectID;
  pl: { id: string | number; name: string }[] | undefined;
};
