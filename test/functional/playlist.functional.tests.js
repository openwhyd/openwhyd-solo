//@ts-check
const assert = require('assert');
const { features } = require('../../app/domain/OpenWhydFeatures');

describe('playlist', () => {
    const inMemoryUserRepository = {
        createPlaylist: (userId, playlistName, callback) => {
            callback({
                id: '0',
                name: playlistName,
            });
        },
    };

    const { createPlaylist } = features(inMemoryUserRepository);

    it('should be created for a user with no playlist', () => {
        return createPlaylist('userId', 'playlistName').then((playlist) => {
            assert.equal(playlist.id, '0');
            assert.equal(playlist.name, 'playlistName');
        });
    });
});
