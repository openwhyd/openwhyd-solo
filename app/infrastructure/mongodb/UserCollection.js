//@ts-check
/**
 * @typedef {import('../../../app/domain/spi/UserRepository').UserRepository} UserRepository
 * @typedef {import('./types').UserDocument} UserDocument
 * @typedef {import('../../../app/domain/user/types').User} UserType
 * @typedef {import('../../../app/domain/user/types').Playlist} Playlist
 */

const { fetchByUid, save } = require('../../models/user');
const { StowawayUser } = require('./StowawayUser');

/**
 * @type {UserRepository}
 */
exports.userCollection = {
  getByUserId: (userId) =>
    new Promise((resolve) => fetchByUid(userId, mapToDomainUser(resolve))),
  save: (user) =>
    new Promise((resolve) =>
      save(
        /**@type {StowawayUser} */ (user).toUserDocument(),
        mapToDomainUser(resolve)
      )
    ),
};

/**
 *
 * @param {(user: StowawayUser) => void } resolve
 * @returns {(user: UserDocument) => void}
 */
function mapToDomainUser(resolve) {
  return (userDocument) => {
    userDocument.pl = userDocument.pl || [];

    const playlists = userDocument.pl.map(({ id, name }) => ({
      id: parseInt(id),
      name,
    }));
    return resolve(new StowawayUser(userDocument.id, playlists, userDocument));
  };
}
