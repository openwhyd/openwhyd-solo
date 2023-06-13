// @ts-check

const assert = require('assert');
const { createFeatures } = require('../../app/domain/features');

/** @type {{[id: string]: import("../../app/domain/types").User}} */
const users = {
  userWithoutPlaylist: { id: 'userWithoutPlaylist', playlists: [] },
  userWithPlaylist: {
    id: 'userWithPlaylist',
    playlists: [{ id: 0, name: 'whatever' }],
  },
};

/** @type {import("../../app/domain/spi").UserRepository} */
const userRepository = {
  getUserById: function (userId) {
    return Promise.resolve(users[userId]);
  },
  insertPlaylist: function (userId, playlist) {
    users[userId].playlists.push(playlist);
    return Promise.resolve();
  },
};

const { createPlaylist } = createFeatures(userRepository);

describe('playlist', () => {
  it('should be created by a user without playlist', async () => {
    const playlistName = 'summer mega mix 2022';
    const playlist = await createPlaylist('userWithoutPlaylist', playlistName);
    assert.equal(playlist.id, 0);
    assert.equal(playlist.name, playlistName);
    assert.deepEqual(users['userWithoutPlaylist'].playlists, [playlist]);
  });

  it('should be created by a user with playlist', async () => {
    const playlistName = 'summer mega mix 2023';
    const playlist = await createPlaylist('userWithPlaylist', playlistName);
    assert.equal(playlist.id, 1);
    assert.equal(playlist.name, playlistName);
    assert.deepEqual(users['userWithPlaylist'].playlists[1], playlist);
  });
});
