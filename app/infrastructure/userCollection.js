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
    const user = await mongodb.collections.user.findOne({
      _id: mongodb.ObjectId(userId),
    });
    return {
      ...user,
      playlists: (user.pl || []).map((playlist) => ({
        id: parseInt(playlist.id, 10),
        name: playlist.name,
      })),
    };
  },
};

module.exports = userCollection;
