// Run with: $ npm run test:approval

const approvals = require('approvals').mocha();
const util = require('util');

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

async function setupTestEnv() {
  const {
    makeJSONScrubber,
    dumpMongoCollection,
    readMongoDocuments,
    insertTestData,
    startOpenwhydServer,
  } = require('../approval-tests-helpers');
  const api = require('../api-client');
  const context = { api, makeJSONScrubber, dumpMongoCollection };
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

async function teardownTestEnv(context) {
  if (context.serverProcess?.kill && !DONT_KILL) {
    await context.serverProcess.kill('SIGINT');
  }
}

describe('When posting a track', function () {
  let context;
  let postedTrack;

  before(async () => {
    context = await setupTestEnv();
    const user = context.testDataCollections.user[0];
    const post = {
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
    };
    const { jar } = await util.promisify(context.api.loginAs)(user);
    postedTrack = (await util.promisify(context.api.addPost)(jar, post)).body;
  });

  after(() => teardownTestEnv(context));

  const scrubObjectId =
    (objectId) =>
    (data = '') =>
      data.replace(objectId, '__OBJECT_ID__');

  it('should respond with the track data', function () {
    const scrub = context.makeJSONScrubber([scrubObjectId(postedTrack._id)]);
    this.verifyAsJSON(scrub(postedTrack)); // or this.verify(data)
  });

  it('should be listed in the "post" db collection', async function () {
    const scrub = context.makeJSONScrubber([scrubObjectId(postedTrack._id)]);
    const dbPosts = await context.dumpMongoCollection(MONGODB_URL, 'post');
    this.verifyAsJSON(scrub(dbPosts));
  });
});

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
});
