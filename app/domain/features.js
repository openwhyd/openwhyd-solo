/** @param {import("./spi").UserRepository} userRepository */
module.exports = (userRepository) => ({
  /** @type {import("./api").CreatePlaylist} */
  createPlaylist: (userId, playlistName) =>
    userRepository.insertPlaylist(userId, playlistName),
});
