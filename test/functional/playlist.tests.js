// @ts-check

const assert = require('assert');
const features = require('../../app/domain/features');

const users = [
  { id: 'user_without_playlists', playlists: [] },
  { id: 'user_with_playlists', playlists: [{ id: 0, name: 'winter megamix' }] },
];

/** @type {import("../../app/domain/spi").UserRepository} */
const userRepository = {
  getByUserId: async function (userId) {
    return users.find((user) => user.id === userId);
  },
  insertPlaylist: async function (userId, playlist) {
    users.find((user) => user.id === userId).playlists.push(playlist);
  },
};

describe('playlist', () => {
  it('should create a playlist for a user without playlist', async () => {
    const userId = 'user_without_playlists';
    const playlistName = 'summer mixtape';
    const { createPlaylist } = features(userRepository);

    const playlist = await createPlaylist(userId, playlistName);

    const user = await userRepository.getByUserId(userId);
    assert.equal(user.playlists.length, 1);
    assert.deepEqual(user.playlists[0], playlist);
    assert.deepEqual(playlist, {
      id: 0,
      name: playlistName,
    });
  });

  it('should create a playlist for a user with playlists', async () => {
    const userId = 'user_with_playlists';
    const playlistName = 'summer mixtape';
    const { createPlaylist } = features(userRepository);

    const playlist = await createPlaylist(userId, playlistName);

    const user = await userRepository.getByUserId(userId);
    assert.equal(user.playlists.length, 2);
    assert.deepEqual(user.playlists[1], playlist);
    assert.deepEqual(playlist, {
      id: 1,
      name: playlistName,
    });
  });
});
