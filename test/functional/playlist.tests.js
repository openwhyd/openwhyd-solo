// @ts-check

const assert = require('assert');
const { createFeatures } = require('../../app/domain/features');

/** @type {import("../../app/domain/types").User} */
const userWithoutPlaylist = {
  id: 'userWithoutPlaylist',
  playlists: [],
};

/** @type {import("../../app/domain/types").User} */
const userWithPlaylist = {
  id: 'userWithPlaylist',
  playlists: [{ id: 2, name: 'my playlist' }],
};

const users = [userWithoutPlaylist, userWithPlaylist];

/** @type {import("../../app/domain/spi").UserRepository} */
const userRepository = {
  fetchUserById: async function (id) {
    return users.find((user) => user.id === id);
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
    const playlist = await createPlaylist(userWithoutPlaylist.id, playlistName);
    assert.equal(playlist.id, 0);
    assert.equal(playlist.name, playlistName);
    const user = await userRepository.fetchUserById(userWithoutPlaylist.id);
    assert.equal(user.playlists.length, 1);
    assert.deepEqual(user.playlists[0], playlist);
  });

  it('should be created by a user with playlist', async () => {
    const playlistName = 'summer mega mix 2023';
    const playlist = await createPlaylist(userWithPlaylist.id, playlistName);
    assert.equal(playlist.id, 3);
    assert.equal(playlist.name, playlistName);
    const user = await userRepository.fetchUserById(userWithPlaylist.id);
    assert.equal(user.playlists.length, 2);
    assert.deepEqual(user.playlists[1], playlist);
  });
});
