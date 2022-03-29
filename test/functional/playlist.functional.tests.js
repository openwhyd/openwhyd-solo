// @ts-check

const assert = require('assert');
const features = require('../../app/domain/features');

const { createPlaylist } = features({
  createPlaylist(userId, playlistName, callback) {
    callback({ id: 0, name: playlistName });
  },
});

describe('playlist', () => {
  it('should be created for user without playlist', async () => {
    const userId = 0;
    const playlistName = 'coucou';
    const playlist = await createPlaylist(userId, playlistName);
    assert.equal(playlist.id, 0);
    assert.equal(playlist.name, playlistName);
  });
});
