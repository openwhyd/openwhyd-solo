// Run with: $ npm run test:approval

const approvals = require('approvals').mocha();
const util = require('util');
const request = require('request');
const { URL_PREFIX } = require('../fixtures.js');

const {
  START_WITH_ENV_FILE,
  PORT, // Note: if PORT is not provided, approval-tests-helpers will start Openwhyd's server programmatically, using START_WITH_ENV_FILE
  DONT_KILL,
} = process.env;

const MONGODB_URL =
  process.env.MONGODB_URL || 'mongodb://localhost:27117/openwhyd_test';

approvals.configure({
  reporters: ['nodediff'], // displays colors in diff
});

const scrubObjectId =
  (objectId) =>
  (data = '') =>
    data.replace(objectId, '__OBJECT_ID__');

const makePostFromBk = (user) => ({
  uId: user._id,
  uNm: user.name,
  text: '',
  name: 'BOYLE - Roppongi Hills (Music Video)',
  eId: '/yt/jI3YrVfOksE',
  ctx: 'bk',
  img: 'https://i.ytimg.com/vi/jI3YrVfOksE/default.jpg',
  src: {
    id: 'https://www.youtube.com/watch?v=jI3YrVfOksE',
    name: 'BOYLE - Roppongi Hills (Music Video) - YouTube',
  },
});

async function setupTestEnv() {
  const {
    makeJSONScrubber,
    ObjectId,
    dumpMongoCollection,
    readMongoDocuments,
    insertTestData,
    startOpenwhydServer,
  } = require('../approval-tests-helpers');
  const api = require('../api-client');
  const context = {
    api,
    makeJSONScrubber,
    ObjectId,
    dumpMongoCollection,
    insertTestData,
  };
  // insert fixtures / test data
  context.testDataCollections = {
    user: await readMongoDocuments(__dirname + '/../approval.users.json.js'),
    post: [], // await readMongoDocuments(__dirname + '/../approval.posts.json.js'),
  };
  await insertTestData(MONGODB_URL, context.testDataCollections);
  // start openwhyd server
  context.serverProcess = await startOpenwhydServer({
    startWithEnv: START_WITH_ENV_FILE,
    port: PORT,
  });
  return context;
}

function teardownTestEnv(context) {
  if (context.serverProcess?.kill && !DONT_KILL) {
    context.serverProcess.kill('SIGINT');
  }
}

// basic example / template for next tests
describe('When setting up a new test environment', function () {
  let context;

  before(async () => {
    context = await setupTestEnv();
  });

  after(() => teardownTestEnv(context));

  it('should have an empty "post" db collection', async function () {
    const dbPosts = await context.dumpMongoCollection(MONGODB_URL, 'post');
    this.verifyAsJSON(dbPosts);
  });

  it('should have the initial "user" db collection', async function () {
    const dbUsers = await context.dumpMongoCollection(MONGODB_URL, 'user');
    this.verifyAsJSON(dbUsers);
  });
});

describe('When posting a track', () => {
  let context;
  let postedTrack;

  before(async () => {
    context = await setupTestEnv();
    const user = context.testDataCollections.user[0];
    const post = {
      eId: '/yt/XdJVWSqb4Ck',
      name: 'Lullaby - Jack Johnson and Matt Costa',
    };
    const { jar } = await util.promisify(context.api.loginAs)(user);
    postedTrack = (await util.promisify(context.api.addPost)(jar, post)).body;
  });

  after(() => teardownTestEnv(context));

  it('should be listed in the "post" db collection', async function () {
    const scrub = context.makeJSONScrubber([scrubObjectId(postedTrack._id)]);
    const dbPosts = await context.dumpMongoCollection(MONGODB_URL, 'post');
    this.verifyAsJSON(scrub(dbPosts));
  });
});

describe('When posting a track using the bookmarklet', function () {
  let context;
  let postedTrack;

  before(async () => {
    context = await setupTestEnv();
    const user = context.testDataCollections.user[0];
    const post = makePostFromBk(user);
    const { jar } = await util.promisify(context.api.loginAs)(user);
    postedTrack = (await util.promisify(context.api.addPost)(jar, post)).body;
  });

  after(() => teardownTestEnv(context));

  it('should be listed in the "post" db collection', async function () {
    const scrub = context.makeJSONScrubber([scrubObjectId(postedTrack._id)]);
    const dbPosts = await context.dumpMongoCollection(MONGODB_URL, 'post');
    this.verifyAsJSON(scrub(dbPosts));
  });
});

describe('When renaming a track', function () {
  const newName = 'coucou';
  let context;
  let postedTrack;

  before(async () => {
    context = await setupTestEnv();
    const user = context.testDataCollections.user[0];
    const post = makePostFromBk(user);
    await context.insertTestData(MONGODB_URL, { post });
    const { jar } = await util.promisify(context.api.loginAs)(user);
    (await util.promisify(context.api.addPost)(jar, post)).body;

    postedTrack = (await context.dumpMongoCollection(MONGODB_URL, 'post'))[0];

    await new Promise((resolve, reject) =>
      request.post(
        {
          jar,
          form: {
            action: 'insert',
            eId: post.eId,
            name: newName,
            _id: postedTrack._id.toString(),
            pl: { id: null, name: 'full stream' },
          },
          url: `${URL_PREFIX}/api/post`,
        },
        (error, response, body) =>
          error ? reject(error) : resolve({ response, body })
      )
    );
  });

  after(() => teardownTestEnv(context));

  it('should be listed with new name in the "post" db collection', async function () {
    const scrub = context.makeJSONScrubber([
      scrubObjectId(postedTrack._id.toString()),
    ]);
    const dbPosts = await context.dumpMongoCollection(MONGODB_URL, 'post');
    this.verifyAsJSON(scrub(dbPosts));
  });
});

describe('When posting a track to an existing playlist', function () {
  let context;
  let postedTrack;
  const pl = { id: '2', name: '🎸 Rock' };

  before(async () => {
    context = await setupTestEnv();
    const user = context.testDataCollections.user[0];
    const post = { ...makePostFromBk(user), pl };
    const { jar } = await util.promisify(context.api.loginAs)(user);
    postedTrack = (await util.promisify(context.api.addPost)(jar, post)).body;
  });

  after(() => teardownTestEnv(context));

  it('should be listed in the "post" db collection', async function () {
    const scrub = context.makeJSONScrubber([scrubObjectId(postedTrack._id)]);
    const dbPosts = await context.dumpMongoCollection(MONGODB_URL, 'post');
    this.verifyAsJSON(scrub(dbPosts));
  });

  it('should not update the user\'s playlists in the "user" db collection', async function () {
    const dbUsers = await context.dumpMongoCollection(MONGODB_URL, 'user');
    this.verifyAsJSON(dbUsers);
  });
});

describe('When posting a track to a new playlist', function () {
  let context;
  let postedTrack;
  const pl = { id: 'create', name: 'My New Playlist' };

  before(async () => {
    context = await setupTestEnv();
    const user = context.testDataCollections.user[0];
    const post = { ...makePostFromBk(user), pl };
    const { jar } = await util.promisify(context.api.loginAs)(user);
    postedTrack = (await util.promisify(context.api.addPost)(jar, post)).body;
  });

  after(() => teardownTestEnv(context));

  it('should be listed in the "post" db collection', async function () {
    const scrub = context.makeJSONScrubber([scrubObjectId(postedTrack._id)]);
    const dbPosts = await context.dumpMongoCollection(MONGODB_URL, 'post');
    this.verifyAsJSON(scrub(dbPosts));
  });

  it('should update the user\'s playlists in the "user" db collection', async function () {
    const dbUsers = await context.dumpMongoCollection(MONGODB_URL, 'user');
    this.verifyAsJSON(dbUsers); // Note: this reveals a bug in the automatic numbering of new playlists, when playlists are listed in reverse order, cf https://github.com/openwhyd/openwhyd-solo/blob/73734c0ab665f6701af7aa8b5b9ce635ad8a2b2f/app/models/user.js#L434
  });
});
