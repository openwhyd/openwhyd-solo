// @ts-check

const mongodb = require('../models/mongodb.js');

/** @type {import('../domain/spi').UserRepository} */
const userCollection = {
  insertPlaylist: function (userId, playlist) {
    return mongodb.collections.user.updateOne(
      { _id: mongodb.ObjectId(userId) },
      { $push: { pl: playlist } }
    );
  },
  getByUserId: async function (userId) {
    /** @type { import("./types").UserDocument } */
    const userDocument = await mongodb.collections.user.findOne({
      _id: mongodb.ObjectId(userId),
    });
    return mapToUser(userDocument);
  },
};

/** @param { import("./types").UserDocument } userDocument */
/** @returns { import("../domain/types").User } */
function mapToUser(userDocument) {
  return {
    id: userDocument._id.toString(),
    playlists: (userDocument.pl || []).map((playlist) => ({
      id: parseInt(playlist.id, 10),
      name: playlist.name,
    })),
  };
}

module.exports = userCollection;
