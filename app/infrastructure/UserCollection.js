//@ts-check

const mongodb = require('../models/mongodb');

// mongodb implementation of UserRepository

/** @type {import("../domain/spi").UserRepository} */
const userCollection = {
  getUserById: async function (userId) {
    /** @type import("./types").UserDocument */
    const userDocument = await mongodb.collections['user'].findOne({
      _id: mongodb.ObjectId(userId),
    });
    return {
      id: userDocument._id.toString(),
      playlists: userDocument.pl.map(({ id, ...rest }) => ({
        id: typeof id === 'string' ? parseInt(id, 10) : id,
        ...rest,
      })),
    };
  },
  insertPlaylist: async function (userId, playlist) {
    await mongodb.collections['user'].updateOne(
      { _id: mongodb.ObjectId(userId) },
      { $push: { pl: playlist } }
    );
  },
};

module.exports = { userCollection };
