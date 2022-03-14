//@ts-check
const User = require('../../domain/user/User');

/**
 * @typedef {import('../../domain/user/types').User} UserType
 * @typedef {import('../../domain/user/types').Playlist} Playlist
 * @typedef {import('./types').UserDocument} UserDocument
 */
exports.StowawayUser = class StowawayUser extends User {
  #userDocument;
  /**
   * @param {string} id
   * @param {Playlist[]} playlists
   * @param {UserDocument} userDocument
   */
  constructor(id, playlists, userDocument) {
    super(id, playlists);
    this.#userDocument = userDocument;
    void (/** @type {UserType} */ (this));
  }

  /**
   * @returns {UserDocument}
   */
  toUserDocument() {
    forbidsInvalidOperations(this.#userDocument.pl, this.playlists);

    const newPlaylist = findNewPlaylist(this.#userDocument.pl, this.playlists);
    const updatedPlaylists = newPlaylist
      ? [...this.#userDocument.pl, newPlaylist]
      : this.#userDocument.pl;

    return { ...this.#userDocument, pl: updatedPlaylists };
  }
};

function findNewPlaylist(originalPlaylists, newPlaylists) {
  return newPlaylists.find(
    (playlist) =>
      !originalPlaylists.find(
        (pl) => parseInt(pl.id) === playlist.id && pl.name === playlist.name
      )
  );
}

function forbidsInvalidOperations(originalPlaylists, newPlaylists) {
  originalPlaylists?.forEach((playlist) => {
    if (
      !newPlaylists.find(
        (newPlayList) =>
          newPlayList.id === parseInt(playlist.id) &&
          newPlayList.name === playlist.name
      )
    ) {
      throw new Error(`Playlist id ${playlist.id} alteration is not permitted`);
    }
  });
}
