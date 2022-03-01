var assert = require('assert');
const util = require('util');
const request = require('request');

var { DUMMY_USER, cleanup, URL_PREFIX } = require('../fixtures.js');
var api = require('../api-client.js');

describe(`post api`, function () {
  before(cleanup); // to prevent side effects between tests

  var pId, uId;
  const post = {
    eId: '/yt/XdJVWSqb4Ck',
    name: 'Lullaby - Jack Johnson and Matt Costa',
  };

  it("should edit a track's name", async function () {
    const { jar } = await util.promisify(api.loginAs)(DUMMY_USER);
    const { body } = await util.promisify(api.addPost)(jar, post);
    const pId = body._id;
    const newName = 'coucou';
    await new Promise((resolve, reject) =>
      request.post(
        {
          jar,
          url: `${URL_PREFIX}/api/post?action=insert&eId=%2Fyt%2FXdJVWSqb4Ck&name=${newName}&src%5Bid%5D=&src%5Bname%5D=&_id=${pId}&pl%5Bname%5D=full+stream&pl%5Bid%5D=null&text=`,
        },
        (error, response, body) =>
          error ? reject(error) : resolve({ response, body })
      )
    );
    const res = await new Promise((resolve, reject) =>
      request.get(
        `${URL_PREFIX}/c/${pId}?format=json`,
        (error, response, body) =>
          error ? reject(error) : resolve({ response, body })
      )
    );
    const postedTrack = JSON.parse(res.body).data;
    assert.equal(postedTrack.name, newName);
    assert.equal(postedTrack.eId, post.eId);
  });

  it(`should allow adding a track`, function (done) {
    api.loginAs(DUMMY_USER, function (error, { jar }) {
      api.addPost(jar, post, function (error, { body }) {
        assert.ifError(error);
        assert.equal(body.eId, post.eId);
        assert.equal(body.name, post.name);
        assert(body._id);
        pId = body._id;
        uId = body.uId;
        done();
      });
    });
  });

  // TODO: "should add a track from a blog"

  // TODO: "should add a track from bookmarklet"

  // TODO: "should add a track from hot tracks"

  // TODO: "should add a track to an existing playlist"

  // TODO: "should add a track to a new playlist"

  // TODO: "should warn if about to add a track that I already posted in the past"

  // TODO: fix consistency in naming of tests

  // TODO: "should ask to login if trying to add track without session"

  it(`should allow re-adding a track (aka "repost")`, function (done) {
    api.loginAs(DUMMY_USER, function (error, { jar }) {
      api.addPost(jar, { pId }, function (error, { body }) {
        assert.ifError(error);
        assert(body._id);
        assert.notEqual(body._id, pId);
        assert.equal(body.repost.pId, pId);
        assert.equal(body.eId, post.eId);
        assert.equal(body.name, post.name);
        done();
      });
    });
  });

  // TODO: "should re-add a track into a new playlist"

  // TODO: "should re-add a track into an existing playlist"

  // TODO: "should allow re-adding a track into another playlist"

  var playlistFullId;
  const firstPlaylistIndex = 0;
  const postInPlaylist = Object.assign({}, post, {
    pl: {
      id: 'create',
      name: 'my first playlist',
    },
  });

  it(`should allow adding a track to a playlist`, function (done) {
    api.loginAs(DUMMY_USER, function (error, { jar }) {
      api.addPost(jar, postInPlaylist, function (error, { body }) {
        assert.ifError(error);
        assert(body._id);
        assert.equal(body.eId, postInPlaylist.eId);
        assert.equal(body.name, postInPlaylist.name);
        assert.equal(body.pl.id, firstPlaylistIndex);
        assert.equal(body.pl.name, postInPlaylist.pl.name);
        done();
      });
    });
  });

  it(`make sure that the playlist was created`, function (done) {
    api.loginAs(DUMMY_USER, function (error, { jar }) {
      api.getUser(jar, {}, function (error, { body }) {
        assert.equal(body.pl.length, 1);
        assert.equal(body.pl[0].id, firstPlaylistIndex);
        assert.equal(body.pl[0].name, postInPlaylist.pl.name);
        assert.equal(body.pl[0].nbTracks, 1);
        playlistFullId = [body.id, firstPlaylistIndex].join('_');
        done();
      });
    });
  });

  it(`should find 1 track in the playlist`, function (done) {
    api.loginAs(DUMMY_USER, function (error, { jar }) {
      api.getPlaylist(jar, playlistFullId, function (error, { body }) {
        assert.ifError(error);
        assert.equal(body.length, 1);
        assert.equal(body[0].id, playlistFullId);
        assert.equal(body[0].plId, firstPlaylistIndex);
        assert.equal(body[0].nbTracks, 1);
        done();
      });
    });
  });

  it(`should return 1 track in the playlist`, function (done) {
    api.loginAs(DUMMY_USER, function (error, { jar }) {
      api.getPlaylistTracks(
        jar,
        `u/${uId}`,
        firstPlaylistIndex,
        function (error, { body }) {
          assert.equal(body.length, 1);
          assert.equal(body[0].pl.id, firstPlaylistIndex);
          assert.equal(body[0].pl.name, postInPlaylist.pl.name);
          done();
        }
      );
    });
  });

  it(`should return 1 track in the playlist, with limit=1000`, function (done) {
    api.loginAs(DUMMY_USER, function (error, { jar }) {
      const url = `/u/${uId}/playlist/${firstPlaylistIndex}?format=json&limit=1000`;
      api.get(jar, url, function (error, { body }) {
        assert.equal(body.length, 1);
        assert.equal(body[0].pl.id, firstPlaylistIndex);
        assert.equal(body[0].pl.name, postInPlaylist.pl.name);
        done();
      });
    });
  });

  it(`should return tracks if two limit parameters are provided`, function (done) {
    api.loginAs(DUMMY_USER, function (error, { jar }) {
      const url = `/u/${uId}/playlist/${firstPlaylistIndex}?format=json&limit=1000&limit=20`;
      // => the `limit` property will be parsed as ["1000","20"] => causing bug #89
      api.get(jar, url, function (error, { body }) {
        assert.notEqual(body.length, 0);
        done();
      });
    });
  });

  // TODO: update post
  // TODO: delete post

  it(`should return the comment data after adding it`, function (done) {
    api.loginAs(DUMMY_USER, function (error, { jar }) {
      const comment = {
        pId,
        text: 'hello world',
      };
      api.addComment(jar, comment, function (error, { body }) {
        assert.ifError(error);
        assert.equal(body.pId, comment.pId);
        assert.equal(body.text, comment.text);
        assert(body._id);
        done();
      });
    });
  });
});
