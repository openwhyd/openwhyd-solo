//@ts-check
/**
 * @typedef {import('../../../app/domain/spi/UserRepository').UserRepository} UserRepository
 * @typedef {import('./types').UserDocument} UserDocument
 * @typedef {import('../../../app/domain/user/types').User} UserType
 * @typedef {import('../../../app/domain/user/types').Playlist} Playlist
 */

const User = require('../../domain/user/User');
const { fetchByUid, save } = require('../../models/user');

/**
 * @type {UserRepository}
 */
exports.userCollection = {
  getByUserId: (userId) =>
    new Promise((resolve) => fetchByUid(userId, mapToDomainUser(resolve))),
  save: (user) =>
    new Promise((resolve) =>
      save(mapToUserDocument(user), mapToDomainUser(resolve))
    ),
};

/**
 *
 * @param {(user: UserType) => void } resolve
 * @returns {(user: UserDocument) => void}
 */
function mapToDomainUser(resolve) {
  return (userDocument) => resolve(new User(userDocument.id, userDocument.pl));
}

/**
 *
 * @param {UserType} user
 * @returns {UserDocument}
 */
const mapToUserDocument = (user) => ({ id: user.id, pl: user.playlists });
