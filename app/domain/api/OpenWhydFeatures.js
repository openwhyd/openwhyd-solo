//@ts-check
/**
 * @param {import('../spi/UserRepository').UserRepository} userRepository
 * @returns {import('./Features').Features}
 */
exports.features = function (userRepository) {
  return {
    /**
     * @type {import('./Features').CreatePlaylist}
     */
    createPlaylist: (userId, playlistName) =>
      new Promise((resolve) => {
        userRepository.createPlaylist(userId, playlistName, resolve);
      }),
  };
};
