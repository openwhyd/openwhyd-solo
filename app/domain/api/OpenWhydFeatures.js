//@ts-check
/**
 * @param {import('../spi/UserRepository').UserRepository} userRepository 
 * @returns {import('./Features').Features}
 */

exports.features = function (userRepository) {
    return {
        /**
         * @type {import('./Features').CreatePlaylist}
         */
        createPlaylist: userRepository.createPlaylist
    };
}