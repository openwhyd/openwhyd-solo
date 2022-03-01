var assert = require('assert');
const util = require('util');
const request = require('request');

var { DUMMY_USER, cleanup, URL_PREFIX } = require('../fixtures.js');
var api = require('../api-client.js');

describe(`post api`, function () {
  let post;
  let jar;

  before(cleanup); // to prevent side effects between test suites

  beforeEach(async () => {
    post = {
      eId: `/yt/${Math.random().toString(36).substring(2, 9)}`,
      name: `Lullaby - Jack Johnson and Matt Costa`,
    };

    ({ jar } = await util.promisify(api.loginAs)(DUMMY_USER));
  });

  it("should edit a track's name", async function () {
    const { body } = await util.promisify(api.addPost)(jar, post);
    const pId = body._id;
    const newName = 'coucou';
    await new Promise((resolve, reject) =>
      request.post(
        {
          jar,
          form: {
            action: 'insert',
            eId: post.eId,
            name: newName,
            _id: pId,
            pl: { id: null, name: 'full stream' },
          },
          url: `${URL_PREFIX}/api/post`,
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
    const { data: postedTrack } = JSON.parse(res.body);
    assert.equal(postedTrack.name, newName);
    assert.equal(postedTrack.eId, post.eId);
  });

  // TODO: "should add a track from a blog"

  // TODO: "should add a track from bookmarklet"

  // TODO: "should add a track from hot tracks"

  // TODO: "should add a track to an existing playlist"

  // TODO: "should add a track to a new playlist"

  // TODO: "should warn if about to add a track that I already posted in the past"

  // TODO: fix consistency in naming of tests

  // TODO: "should ask to login if trying to add track without session"

  it('should re-add a track into a new playlist', async function () {
    const { body } = await util.promisify(api.addPost)(jar, post);
    const pId = body._id;
    const name = body.name;
    const ctx = 'bk';
    const newPlayListName = 'My New Playlist';

    await new Promise((resolve, reject) =>
      request.post(
        {
          jar,
          form: {
            action: 'insert',
            eId: post.eId,
            name: name,
            _id: pId,
            ctx: ctx,
            pl: { id: 'create', name: newPlayListName },
          },
          url: `${URL_PREFIX}/api/post`,
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
    const { data: postedTrack } = JSON.parse(res.body);
    assert.equal(postedTrack.name, name);
    assert.equal(postedTrack.eId, post.eId);
    assert.equal(postedTrack.ctx, ctx);
    assert.equal(postedTrack.pl.name, newPlayListName);
    assert.equal(postedTrack.uId, DUMMY_USER.id);
    /*Note: looks like the api is returning isNew=true while inspecting the request with the developer tools on the UI
      but it doesn't seem to be the case with this test...
    */
  });

  // TODO: "should re-add a track into an existing playlist"

  // TODO: "should allow re-adding a track into another playlist"

  // TODO: update post
  // TODO: delete post
});
