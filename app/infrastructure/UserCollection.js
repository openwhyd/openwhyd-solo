// @ts-check

const mongodb = require('../models/mongodb');

/** @type {import("../domain/spi").UserRepository} */
const UserCollection = {
  fetchUserById: async function (id) {
    /** @type {import("./types").UserDocument} */
    const userDocument = await mongodb.collections.user.findOne({
      _id: mongodb.ObjectId(id),
    });
    const user = {
      id: userDocument._id.toString(),
      playlists: (userDocument.pl || []).map((playlist) => ({
        id:
          typeof playlist.id === 'string' ? parseInt(playlist.id) : playlist.id,
        name: playlist.name,
      })),
    };
    return user;
  },
  insertPlaylist: async function (userId, playlist) {
    await mongodb.collections.user.updateOne(
      { _id: mongodb.ObjectId(userId) },
      { $push: { pl: playlist } }
    );
  },
};

module.exports = { UserCollection };
