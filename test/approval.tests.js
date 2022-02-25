const personas = [
  { label: 'Visitor', userId: undefined },
  { label: 'User: Adrien', userId: '4d94501d1f78ac091dbc9b4d' },
  { label: 'User: A New User', userId: '000000000000000000000003' },
];

const formats = ['HTML', 'JSON'];

const routes = [
  { label: "Adrien's Profile, page 1", path: '/adrien' },
  {
    label: "Adrien's Profile, page 2",
    path: '/adrien?after=600ec1c703e2014e630c8137',
  },
  { label: "Adrien's Profile - liked tracks", path: '/adrien/likes' },
  { label: "Adrien's Profile - playlists", path: '/adrien/playlists' },
  { label: "Adrien's Profile - playlist 1", path: '/adrien/playlist/1' },
  {
    label: "A New User's Profile, page 1",
    path: '/u/000000000000000000000003',
  },
  {
    label: "A New User's Profile - liked tracks",
    path: '/u/000000000000000000000003/likes',
  },
  {
    label: "A New User's Profile - playlists",
    path: '/u/000000000000000000000003/playlists',
  },
  {
    label: "A New User's Profile - playlist 1",
    path: '/u/000000000000000000000003/playlist/1',
  },
  {
    label: 'Unknown Profile',
    path: '/u/000000000000000000000004',
  },
  {
    label: "Adrien's Profile - Playlist creation",
    path: '/adrien/playlist/create',
  },
  {
    label: "A New User's Profile - Playlist creation",
    path: '/u/000000000000000000000003/playlist/create',
  },
];

formats.forEach((format) => {
  routes.forEach((route) => {
    personas.forEach((persona) => {
      test(`${persona.label}, ${route.label}, ${format}`, async (t) => {
        const { openwhyd } = t.context;
        // 1. login (or logout) and make sure that it worked as expected
        const { userId } = persona;
        const { jar, loggedIn, response } =
          persona.label === 'Visitor'
            ? await promisify(openwhyd.logout)(null)
            : await promisify(openwhyd.loginAs)(t.context.getUser(userId));
        if (userId && !loggedIn) {
          t.fail(`login failed: ${response.body}`);
        }
        // 2. test that the response is still the same
        const path =
          format === 'JSON'
            ? route.jsonPath ||
              route.path.replace(/\?|$/, `?format=${format.toLowerCase()}&`)
            : route.path;
        const { body } = await promisify(openwhyd.getRaw)(jar, path);
        t.snapshot(await getCleanedPageBody(body));
      });
    });
  });
});
