// @ts-check

/** @param {import("./spi").UserRepository} userRepository */
function createFeatures(userRepository) {
  return {
    /** @type {import("./api").CreatePlaylist} */
    createPlaylist: async (userId, playlistName) => {
      const user = await userRepository.getUserById(userId);
      const playlist = {
        id:
          user.playlists.length > 0
            ? user.playlists[user.playlists.length - 1].id + 1
            : 0,
        name: playlistName,
      };
      await userRepository.insertPlaylist(userId, playlist);
      return playlist;
    },
  };
}

module.exports = { createFeatures };
