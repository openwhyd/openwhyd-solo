//@ts-check
/**
 * @typedef {import('../../../app/domain/spi/UserRepository').UserRepository} UserRepository
 * @typedef {import('./types').UserDocument} UserDocument
 * @typedef {import('../../../app/domain/user/types').User} UserType
 * @typedef {import('../../../app/domain/user/types').Playlist} Playlist
 */

const { fetchByUid } = require('../../models/user');
const User = require('../../domain/user/User');
const mongodb = require('../../models/mongodb');

/**
 * @type {UserRepository}
 */
exports.userCollection = {
  getByUserId: (userId) =>
    new Promise((resolve) => fetchByUid(userId, mapToDomainUser(resolve))),

  insertPlaylist: (userId, playlist) =>
    // TODO: return updateOne() function's promise directly, if possible, instead of recreating our own
    new Promise((resolve, reject) =>
      mongodb.collections['user'].updateOne(
        { _id: mongodb.ObjectId(userId) },
        { $push: { pl: playlist } },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      )
    ),
};

/**
 *
 * @param {(user: UserType) => void } resolve
 * @returns {(user: UserDocument) => void}
 */
function mapToDomainUser(resolve) {
  return (userDocument) => {
    userDocument.pl = userDocument.pl || [];

    const playlists = userDocument.pl.map(({ id, name }) => ({
      id: parseInt(id),
      name,
    }));
    return resolve(new User(userDocument.id, playlists));
  };
}
