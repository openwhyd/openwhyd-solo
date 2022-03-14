//@ts-check

/**
 * @typedef {import('../../app/domain/api/Features').CreatePlaylist} CreatePlaylist
 * @typedef {import('../../app/domain/spi/UserRepository').UserRepository} UserRepository
 */
const assert = require('assert');

const { features } = require('../../app/domain/OpenWhydFeatures');
const User = require('../../app/domain/user/User');

const { inMemoryUserRepository } = require('./stubs/InMemoryUserRepository');
const randomString = () => Math.random().toString(36).substring(2, 9);

describe('playlist', () => {
  const userNoPlaylist = new User('userNoPlaylist', []);

  const lastExistingPlaylistId = 42;
  const userWithPlaylist = new User('userWithPlaylist', [
    { id: lastExistingPlaylistId, name: 'existingPlaylist' },
  ]);

  const users = [userNoPlaylist, userWithPlaylist];
  /**
   * @type {CreatePlaylist}
   */
  let createPlaylist;

  /**
   * @type {UserRepository}
   */
  let userRepository;

  beforeEach(() => {
    userRepository = inMemoryUserRepository(users);
    ({ createPlaylist } = features(userRepository));
  });

  it('should be created for a user with no playlist', async () => {
    const playlistName = randomString();

    const playlist = await createPlaylist(userNoPlaylist.id, playlistName);

    assert.equal(playlist.id, 0);
    assert.equal(playlist.name, playlistName);

    const savedUser = await userRepository.getByUserId(userNoPlaylist.id);
    assert.equal(savedUser.playlists.length, 1);
    assert.equal(savedUser.playlists[0], playlist);
  });

  it('should be created for a user having already a playlist', async () => {
    const playlistName = randomString();

    const playlist = await createPlaylist(userWithPlaylist.id, playlistName);

    assert.equal(playlist.id, lastExistingPlaylistId + 1);
    assert.equal(playlist.name, playlistName);

    const savedUser = await userRepository.getByUserId(userWithPlaylist.id);
    const savedPlaylist = savedUser.playlists.find(
      (pl) => pl.id == playlist.id
    );

    assert.equal(
      savedUser.playlists.length,
      userWithPlaylist.playlists.length + 1
    );
    assert.equal(savedPlaylist, playlist);
  });
});
