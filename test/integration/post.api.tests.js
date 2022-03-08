var assert = require('assert');
const util = require('util');
const request = require('request');

var { ADMIN_USER, cleanup, URL_PREFIX } = require('../fixtures.js');
var api = require('../api-client.js');
var { START_WITH_ENV_FILE, DEV } = process.env;
const { startOpenwhydServer } = require('../approval-tests-helpers');
const randomString = () => Math.random().toString(36).substring(2, 9);

describe(`post api`, function () {
  let post;
  let jar;
  let context = {};

  before(cleanup); // to prevent side effects between test suites
  before(async () => {
    if (DEV) {
      context.serverProcess = await startOpenwhydServer({
        startWithEnv: START_WITH_ENV_FILE,
      });
    }
  });
  after(() => {
    if (context.serverProcess?.kill) {
      context.serverProcess.kill('SIGINT');
    }
  });
  beforeEach(async () => {
    post = {
      eId: `/yt/${randomString()}`,
      name: `Lullaby - Jack Johnson and Matt Costa`,
    };

    ({ jar } = await util.promisify(api.loginAs)(ADMIN_USER));
    /* We are forced to use the ADMIN_USER, since DUMMY_USER is mutated by user.api.tests.js and the db cleanup seems to not work for the users collection.
     * May be initdb_testing.js is not up to date with the current schema?
     */
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

  it('should add a track from bookmarklet', async function () {
    const name = randomString();
    const ctx = 'bk';

    const res = await new Promise((resolve, reject) =>
      request.post(
        {
          jar,
          form: {
            action: 'insert',
            eId: post.eId,
            name: name,
            ctx: ctx,
            pl: { id: null, name: 'full stream' },
          },
          url: `${URL_PREFIX}/api/post`,
        },
        (error, response, body) =>
          error ? reject(error) : resolve({ response, body })
      )
    );
    const postedTrack = JSON.parse(res.body);
    assert.equal(postedTrack.name, name);
    assert.equal(postedTrack.eId, post.eId);
    assert.equal(postedTrack.ctx, ctx);
    assert.equal(postedTrack.isNew, true);
    assert.equal(postedTrack.uId, ADMIN_USER.id);
    assert.equal(postedTrack.uNm, ADMIN_USER.name);
    assert.ok(postedTrack._id);
    assert.equal(postedTrack.pl, undefined);
  });

  // TODO: "should add a track from hot tracks"

  // TODO: "should add a track to an existing playlist"

  // TODO: should add a track to a new playlist (where ? if this isnot the bookmarklet ?)

  it('should add a track into a new playlist from the bookmarklet', async function () {
    const { body } = await util.promisify(api.addPost)(jar, post);
    const pId = body._id;
    const name = body.name;
    const ctx = 'bk';
    const newPlayListName = randomString();

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
    assert.equal(postedTrack.uId, ADMIN_USER.id);
    assert.equal(postedTrack.uNm, ADMIN_USER.name);
  });

  // TODO: "should warn if about to add a track that I already posted in the past"

  // TODO: fix consistency in naming of tests

  // TODO: "should ask to login if trying to add track without session"

  it('should re-add a track to a new playlist from the stream', async function () {
    const { body } = await util.promisify(api.addPost)(jar, post);
    const pId = body._id;
    const name = body.name;
    const newPlayListName = randomString();

    const res = await new Promise((resolve, reject) =>
      request.post(
        {
          jar,
          form: {
            action: 'insert',
            eId: post.eId,
            name: name,
            pId: pId,
            pl: { id: 'create', name: newPlayListName },
          },
          url: `${URL_PREFIX}/api/post`,
        },
        (error, response, body) =>
          error ? reject(error) : resolve({ response, body })
      )
    );

    const postedTrack = JSON.parse(res.body);

    assert.equal(postedTrack.name, name);
    assert.equal(postedTrack.eId, post.eId);
    assert.notEqual(postedTrack.pl.id, undefined);
    assert.equal(postedTrack.pl.name, newPlayListName);
    assert.equal(postedTrack.uId, ADMIN_USER.id);
    assert.equal(postedTrack.uNm, ADMIN_USER.name);
    assert.deepEqual(postedTrack.lov, []);
    assert.equal(postedTrack.text, '');
    assert.equal(postedTrack.nbP, 0);
    assert.equal(postedTrack.nbR, 0);

    assert.notEqual(postedTrack._id, pId);

    assert.equal(postedTrack.repost.pId, pId);
    assert.equal(postedTrack.repost.uId, ADMIN_USER.id);
    assert.equal(postedTrack.repost.uNm, ADMIN_USER.name);
  });

  // TODO: "should re-add a track into an existing playlist"

  // TODO: "should allow re-adding a track into another playlist"

  // TODO: update post
  // TODO: delete post
});
