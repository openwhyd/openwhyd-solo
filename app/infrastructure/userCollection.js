//@ts-check

const mongodb = require('../models/mongodb');

/** @type {import("../domain/spi").UserRepository} */
const userCollection = {
  getUserById: async function (userId) {
    /** @type {import("./types").UserDocument} */
    const userDocument = await mongodb.collections.user.findOne({
      _id: mongodb.ObjectId(userId),
    });
    return mapToUser(userDocument);
  },
  insertPlaylist: async function (userId, playlist) {
    await mongodb.collections.user.update(
      { _id: mongodb.ObjectId(userId) },
      { $push: { pl: playlist } }
    );
  },
};

const mapToUser = (userDocument) => ({
  id: userDocument._id.toString(),
  playlists: userDocument.pl.map((playlist) => ({
    id: parseInt(playlist.id, 10),
    name: playlist.name,
  })),
});

module.exports = { userCollection };
