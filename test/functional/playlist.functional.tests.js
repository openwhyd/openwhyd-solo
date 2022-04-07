// @ts-check

const assert = require('assert');
const features = require('../../app/domain/features');

/** @type {import('../../app/domain/types').User[]} */
const users = [
  {
    id: 'user_without_playlist',
    playlists: [],
  },
  {
    id: 'user_with_playlist',
    playlists: [{ id: 1, name: 'my playlist' }],
  },
];

/** @type {import('../../app/domain/spi').UserRepository} */
const userRepository = {
  createPlaylist(userId, playlistName, callback) {
    const user = users.find((user) => user.id === userId);
    const id = user.playlists.length + 1;
    user.playlists.push({
      id,
      name: playlistName,
    });
    callback({ id, name: playlistName });
  },
  getByUserId(userId) {
    return Promise.resolve({ ...users.find((user) => user.id === userId) });
  },
};

const { createPlaylist } = features(userRepository);

describe('playlist', () => {
  it('should be created for user without playlist', async () => {
    const userId = 'user_without_playlist';
    const playlistName = 'coucou';
    const playlist = await createPlaylist(userId, playlistName);
    assert.equal(playlist.id, 1);
    assert.equal(playlist.name, playlistName);
    const user = await userRepository.getByUserId(userId);
    assert.equal(user.playlists.length, 1);
    assert.deepEqual(user.playlists[0], playlist);
  });

  it('should be created for user with playlist', async () => {
    const userId = 'user_with_playlist';
    const playlistName = 'coucou';
    const playlist = await createPlaylist(userId, playlistName);
    assert.equal(playlist.id, 2);
    assert.equal(playlist.name, playlistName);
    const user = await userRepository.getByUserId(userId);
    assert.equal(user.playlists.length, 2);
    assert.deepEqual(user.playlists[1], playlist);
  });
});
