/** @param {import("./spi").UserRepository} userRepository */
module.exports = (userRepository) => ({
  /** @type {import("./api").CreatePlaylist} */
  createPlaylist: (userId, playlistName) =>
    new Promise((resolve) =>
      userRepository.createPlaylist(userId, playlistName, resolve)
    ),
});
