//@ts-check

const { expect } = require('chai');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const {
  StowawayUser,
} = require('../../app/infrastructure/mongodb/StowawayUser');

//@ts-ignore
chai.use(chaiExclude);

describe('StowawayUser', () => {
  let originalUserDocument;
  let originalPlaylists;

  beforeEach(() => {
    originalUserDocument = require('./data/userDocument.json');
    //@ts-ignore
    originalPlaylists = originalUserDocument.pl.map(({ id, name }) => {
      //@ts-ignore
      return { id: parseInt(id), name };
    });
  });

  it('should embeds a UserDocument', () => {
    const stowawayUser = new StowawayUser(
      originalUserDocument.id,
      originalPlaylists,
      originalUserDocument
    );

    expect(stowawayUser.id).to.equal(originalUserDocument.id);
    expect(stowawayUser.playlists).to.equal(originalPlaylists);
    expect(stowawayUser.toUserDocument()).to.deep.equal(originalUserDocument);
  });

  it('should be adapted to a UserDocument for the playlist creation use case', () => {
    const newPlaylist = {
      id: originalPlaylists.length + 1000,
      name: 'new playlist',
    };
    const stowawayUser = new StowawayUser(
      originalUserDocument.id,
      originalPlaylists.concat(newPlaylist),
      originalUserDocument
    );

    const updatedUserDocument = stowawayUser.toUserDocument();

    expect(updatedUserDocument.pl.length).equal(
      originalUserDocument.pl.length + 1
    );
    expect(
      updatedUserDocument.pl.find((playlist) => playlist.id === newPlaylist.id)
    ).to.equal(newPlaylist);
    expect(updatedUserDocument)
      .excluding('pl')
      .to.deep.equal(originalUserDocument);
  });

  it('should not permit playlist deletion in creation use case', () => {
    const updatedPlaylists = [...originalPlaylists];
    const removedPlaylist = updatedPlaylists.pop();

    const stowawayUser = new StowawayUser(
      originalUserDocument.id,
      updatedPlaylists,
      originalUserDocument
    );

    expect(() => stowawayUser.toUserDocument()).to.throw(
      Error,
      `Playlist id ${removedPlaylist.id} alteration is not permitted`
    );
  });

  it('should not permit playlist update in creation use case', () => {
    const updatedPlaylists = [...originalPlaylists];
    const mutatedPlaylist = updatedPlaylists[0];
    mutatedPlaylist.name = 'updated playlist';

    const stowawayUser = new StowawayUser(
      originalUserDocument.id,
      updatedPlaylists,
      originalUserDocument
    );

    expect(() => stowawayUser.toUserDocument()).to.throw(
      Error,
      `Playlist id ${mutatedPlaylist.id} alteration is not permitted`
    );
  });
});
