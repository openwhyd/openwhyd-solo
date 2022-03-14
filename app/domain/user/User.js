//@ts-check
/**
 * @typedef {import('./types').Playlist} Playlist
 * @typedef {import('./types').User} User
 */
/**
 * @type {User}
 */
module.exports = class User {
  /**
   * @param {string} id
   * @param {Playlist[]} playlists
   */
  constructor(id, playlists) {
    this.id = id;
    this.playlists = playlists || [];
    void (/** @type {User} */ (this));
  }

  /**
   * @param {string} playlistName
   * @returns {Promise<[User,Playlist]>}
   */
  addNewPlaylist = (playlistName) => {
    const newPlaylist = {
      id: nextAvailablePlaylistId(this.playlists),
      name: playlistName,
    };
    this.playlists.push(newPlaylist);
    return Promise.resolve([this, newPlaylist]);
  };
};

/**
 * @param {Playlist[]} playlists
 * @returns {number}
 */
function nextAvailablePlaylistId(playlists) {
  return playlists.length === 0 ? 0 : playlists[playlists.length - 1].id + 1;
}
