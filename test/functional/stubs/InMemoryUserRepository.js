//@ts-check
/**
 * @typedef {import('../../../app/domain/spi/UserRepository').UserRepository} UserRepository
 * @typedef {import('../../../app/domain/spi/UserRepository').GetByUserId} GetByUserId
 * @typedef {import('../../../app/domain/spi/UserRepository').Save} Save
 * @typedef {import('../../../app/domain/user/User').User} User
 */

/**
 * @type {(users : User[]) => UserRepository}
 */
exports.inMemoryUserRepository = function (users) {
  const userRepository = new Map(users.map((user) => [user.id, user]));

  return {
    /**
     * @type {GetByUserId}
     */
    getByUserId: function (userId) {
      return Promise.resolve(userRepository.get(userId));
    },
    /**
     * @type {Save}
     */
    save: (user) => {
      userRepository.set(user.id, user);
      return Promise.resolve(user);
    },
  };
};
