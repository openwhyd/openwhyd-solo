// Run with: $ npm run test:approval

require('approvals').mocha();

const {
  readMongoDocuments,
  insertTestData,
  startOpenwhydServer,
} = require('../approval-tests-helpers');

const {
  START_WITH_ENV_FILE,
  PORT, // Note: if PORT is not provided, approval-tests-helpers will start Openwhyd's server programmatically, using START_WITH_ENV_FILE
  DONT_KILL,
} = process.env;

const MONGODB_URL =
  process.env.MONGODB_URL || 'mongodb://localhost:27117/openwhyd_test';

const context = {};

before(async () => {
  const testDataCollections = {
    user: await readMongoDocuments(__dirname + '/../approval.users.json.js'),
    post: await readMongoDocuments(__dirname + '/../approval.posts.json.js'),
  };
  await insertTestData(MONGODB_URL, testDataCollections);

  context.serverProcess = await startOpenwhydServer({
    startWithEnv: START_WITH_ENV_FILE,
    port: PORT,
  });
  context.openwhyd = require('../api-client');
  context.getUser = (id) =>
    testDataCollections.user.find(({ _id }) => id === _id.toString());
});

after(() => {
  if (context.serverProcess?.kill && !DONT_KILL) {
    context.serverProcess.kill('SIGINT');
  }
});

describe('When running some tests', function () {
  it('should be able to use Approvals', function () {
    var data = 'Hello World!';
    this.verify(data); // or this.verifyAsJSON(data)
  });
});
