// @ts-check

/** @param { import("./spi").UserRepository } userRepository */
function features(userRepository) {
  return {
    /**
     * @param { string } userId
     * @param { string } playlistName
     * @returns { Promise<import("./types").Playlist> }
     **/
    async createPlaylist(userId, playlistName) {
      const user = await userRepository.getByUserId(userId);
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

module.exports = features;
