// @ts-check

const assert = require('assert');
const { createFeatures } = require('../../app/domain/features');

/** @type {import("../../app/domain/types").User[]} */
const users = [
  { id: 'userWithoutPlaylist', playlists: [] },
  { id: 'userWithPlaylist', playlists: [{ id: 0, name: 'whatever' }] },
];

/** @type {import("../../app/domain/spi").UserRepository} */
const userRepository = {
  getUserById: async function (userId) {
    return users.find((user) => user.id === userId);
  },
  insertPlaylist: async function (userId, playlist) {
    const user = users.find((user) => user.id === userId);
    user.playlists.push(playlist);
  },
};

const { createPlaylist } = createFeatures(userRepository);

describe('playlist', () => {
  it('should be created by a user without playlist', async () => {
    const playlistName = 'summer mega mix 2022';
    const playlist = await createPlaylist('userWithoutPlaylist', playlistName);
    assert.equal(playlist.id, 0);
    assert.equal(playlist.name, playlistName);
    assert.deepEqual(users[0].playlists, [playlist]);
  });

  it('should be created by a user with playlist', async () => {
    const playlistName = 'summer mega mix 2023';
    const playlist = await createPlaylist('userWithPlaylist', playlistName);
    assert.equal(playlist.id, 1);
    assert.equal(playlist.name, playlistName);
    assert.deepEqual(users[1].playlists[1], playlist);
  });
});
