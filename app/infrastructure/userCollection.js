// @ts-check

const mongodb = require('../models/mongodb');

/** @type { import("../domain/spi").UserRepository } */
const userCollection = {
  getByUserId: async function (userId) {
    const userDocument = await mongodb.collections.user.findOne({
      _id: mongodb.ObjectId(userId),
    });
    return mapToDomainUser(userDocument);
  },
  insertPlaylist: async function (userId, playlist) {
    await mongodb.collections.user.updateOne(
      {
        _id: mongodb.ObjectId(userId),
      },
      {
        $push: { pl: playlist },
      }
    );
  },
};

module.exports = userCollection;

/**
 * @param {import("./types").UserDocument} userDocument
 * @returns {import("../domain/types").User} */
function mapToDomainUser(userDocument) {
  return {
    id: userDocument._id.toString(),
    playlists: (userDocument.pl || []).map((playlist) => ({
      id: typeof playlist.id === 'string' ? parseInt(playlist.id) : playlist.id,
      name: playlist.name,
    })),
  };
}
