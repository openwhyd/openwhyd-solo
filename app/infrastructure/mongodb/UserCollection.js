//@ts-check
/**
 * @typedef {import('../../../app/domain/spi/UserRepository').UserRepository} UserRepository
 * @typedef {import('./types').UserDocument} UserDocument
 * @typedef {import('../../../app/domain/user/types').User} UserType
 * @typedef {import('../../../app/domain/user/types').Playlist} Playlist
 */

const { fetchByUid, save } = require('../../models/user');
const User = require('../../domain/user/User');

/**
 * @type {UserRepository}
 */
exports.userCollection = {
  getByUserId: (userId) =>
    new Promise((resolve) => fetchByUid(userId, mapToDomainUser(resolve))),

  insertPlaylist: (userId, playlist) =>
    new Promise((resolve) =>
      /*
       We are forced to use users.fetchByUid() then users.save() otherwise the database model migration won't be performed.
       But it can be replaced by the following code, if we implement a database migration that adds (id, mid, n, prefs) to all users in the database:

       mongodb.collections['user'].updateOne(
        { _id: ObjectId(userId) },
        { $push: { pl: playlist } },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        })

       */
      fetchByUid(userId, (user) => {
        user.pl = user.pl || [];
        //@ts-ignore
        user.pl.push(playlist);
        //@ts-ignore
        save(user, resolve);
      })
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
