// @ts-check

const mongodb = require('../models/mongodb');

/**
 * @param {import("../infrastructure/types").UserDocument} userDocument
 * @returns {import("../domain/types").User}
 **/
function mapToUser(userDocument) {
  return {
    id: userDocument._id.toString(),
    playlists: userDocument.pl.map((playlist) => ({
      id: typeof playlist.id === 'string' ? parseInt(playlist.id) : playlist.id,
      name: playlist.name,
    })),
  };
}

/** @type {import("../domain/spi").UserRepository} */
const userCollection = {
  getUserById: async function (userId) {
    /** @type {import("../infrastructure/types").UserDocument} */
    const userDocument = await mongodb.collections.user.findOne({
      _id: mongodb.ObjectId(userId),
    });

    return mapToUser(userDocument);
  },
  insertPlaylist: async function (userId, playlist) {
    await mongodb.collections.user.updateOne(
      { _id: mongodb.ObjectId(userId) },
      { $push: { pl: playlist } }
    );
  },
};

module.exports = { userCollection };
