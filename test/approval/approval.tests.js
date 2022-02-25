// Run with: $ npm run test:approval

require('approvals').mocha();
const util = require('util');
const api = require('../api-client');
const {
  makeJSONScrubber,
  readMongoDocuments,
  insertTestData,
  startOpenwhydServer,
} = require('../approval-tests-helpers');

const {
  START_WITH_ENV_FILE,
  PORT, // Note: if PORT is not provided, approval-tests-helpers will start Openwhyd's server programmatically, using START_WITH_ENV_FILE
  DONT_KILL,
} = process.env;

const URL_PREFIX = process.env.URL_PREFIX || 'http://localhost:8080';

const MONGODB_URL =
  process.env.MONGODB_URL || 'mongodb://localhost:27117/openwhyd_test';

const context = {};

before(async () => {
  context.testDataCollections = {
    user: await readMongoDocuments(__dirname + '/../approval.users.json.js'),
    post: await readMongoDocuments(__dirname + '/../approval.posts.json.js'),
  };
  await insertTestData(MONGODB_URL, context.testDataCollections);

  context.serverProcess = await startOpenwhydServer({
    startWithEnv: START_WITH_ENV_FILE,
    port: PORT,
  });
  context.getUser = (id) =>
    context.testDataCollections.user.find(({ _id }) => id === _id.toString());
});

after(() => {
  if (context.serverProcess?.kill && !DONT_KILL) {
    context.serverProcess.kill('SIGINT');
  }
});

describe('When posting a track', function () {
  let postedTrack;

  before(async () => {
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
    const { jar } = await util.promisify(api.loginAs)(user);
    postedTrack = (await util.promisify(api.addPost)(jar, post)).body;
  });

  it('should respond with the track data', function () {
    const scrub = makeJSONScrubber([
      (data = '') => data.replace(postedTrack._id, '__OBJECT_ID__'),
    ]);
    this.verifyAsJSON(scrub(postedTrack)); // or this.verify(data)
  });

  // TODO: it('should be listed in the "post" db collection', function () {
});
