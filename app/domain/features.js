// @ts-check

/** @typedef {import("./types").Playlist} Playlist */

/** @param {import("./spi").UserRepository} userRepository */
module.exports = (userRepository) => ({
  /** @type {import("./api").CreatePlaylist} */
  createPlaylist: async (userId, playlistName) => {
    const user = await userRepository.getByUserId(userId);
    /** @type {Playlist} */
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
});
