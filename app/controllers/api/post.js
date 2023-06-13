//@ts-check

/**
 * api endpoint for posts
 * @author adrienjoly, whyd
 **/

var snip = require('../../snip.js');
var mongodb = require('../../models/mongodb.js');
var postModel = require('../../models/post.js');
var commentModel = require('../../models/comment.js');
var lastFm = require('./lastFm.js').lastFm;

var sequencedParameters = { _1: 'pId', _2: 'action' }; //[null, "pId", "action"];

function getBrowserVersionFromUserAgent(ua) {
  // reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#Browser_Name
  var BROWSER_UA_REGEX = [
    /(openwhyd-electron)\/([^ $]+)/,
    /(Chrome)\/([^ $]+)/,
    /(Chromium)\/([^ $]+)/,
    /(Seamonkey)\/([^ $]+)/,
    /(OPR)\/([^ $]+)/,
    /; (MSIE) ([^ ;$]+);/,
    /(Opera)\/([^ $]+)/,
    /(Safari)\/([^ $]+)/,
    /(Firefox)\/([^ $]+)/,
  ];
  for (let i = 0; i < BROWSER_UA_REGEX.length; ++i) {
    var match = ua.match(BROWSER_UA_REGEX[i]);
    if (match) return match.slice(1, 3); // => [ browser_name, version ]
  }
}

var publicActions = {
  lovers: function (p, callback) {
    postModel.fetchPostById(p.pId, function (post) {
      var lovers = [];
      callback(lovers);
    });
  },

  reposts: function (p, callback) {
    postModel.fetchPosts(
      { 'repost.pId': p.pId },
      null,
      null,
      function (results) {
        var reposts = [];
        callback(reposts);
      }
    );
  },
};

exports.actions = {
  addComment: commentModel.insert,

  deleteComment: commentModel.delete,

  insert: async function (httpParams, callback, _request, features) {
    var postQuery = {
      uId: httpParams.uId,
      uNm: httpParams.uNm,
      text: httpParams.text || '',
      // fields that will be ignored by rePost():
      name: httpParams.name,
      eId: httpParams.eId,
    };

    if (httpParams.ctx) postQuery.ctx = httpParams.ctx;

    function tryJsonParse(p) {
      try {
        return JSON.parse(p);
      } catch (e) {
        return null;
      }
    }

    function actualInsert() {
      if (httpParams.pId) postModel.rePost(httpParams.pId, postQuery, callback);
      else {
        if (httpParams._id)
          // edit mode
          postQuery._id = httpParams._id;

        if (httpParams.img && httpParams.img != 'null')
          postQuery.img = httpParams.img;

        if (httpParams.src)
          // source webpage of the content: {id,name} provided by bookmarklet
          postQuery.src =
            typeof httpParams.src == 'object'
              ? httpParams.src
              : tryJsonParse(httpParams.src);
        else if (httpParams['src[id]'] && httpParams['src[name]'])
          postQuery.src = {
            id: httpParams['src[id]'],
            name: httpParams['src[name]'],
          };
        if (!postQuery.src || !postQuery.src.id) delete postQuery.src;

        postModel.savePost(postQuery, callback);
      }
    }

    const playlistRequest = extractPlaylistRequest(httpParams);

    if (needToCreatePlaylist(playlistRequest)) {
      const playlist = await features.createPlaylist(
        httpParams.uId,
        playlistRequest.name
      );
      if (playlist) {
        postQuery.pl = { id: playlist.id, name: playlistRequest.name };
        // console.log('playlist was created', q.pl);
      }
    } else {
      postQuery.pl = {
        id: parseInt(playlistRequest.id),
        name: playlistRequest.name,
      };
      if (isNaN(playlistRequest.id)) delete postQuery.pl; //q.pl = null;
    }

    actualInsert();
  },
  delete: function (p, callback) {
    postModel.deletePost(
      p._id,
      function (result) {
        callback((result || {}).pop ? result.pop() : {});
      },
      p.uId
    );
  },
  toggleLovePost: function (p, callback) {
    postModel.isPostLovedByUid(p.pId, p.uId, function (loved, post) {
      if (!post) callback({ loved: false, lovers: 0 });
      // to prevent crash when trying to love a repost
      else if (loved)
        postModel.unlovePost(p.pId, p.uId, function () {
          callback({ loved: false, lovers: (post.lov || [1]).length - 1 });
        });
      else
        postModel.lovePost(p.pId, p.uId, function () {
          callback({
            loved: true,
            lovers: (post.lov || []).length + 1,
            post: post,
          });
        });
    });
  },
  incrPlayCounter: function (p, cb, request) {
    // TODO: prevent a user from sending many calls in a row
    if (!p.uId) return cb && cb({ error: 'not logged in' });
    if (mongodb.ObjectId('' + p.pId) === 'invalid_id') {
      // FYI: an old iOS version was sending a "(null)" value
      console.log(
        'warning: skipping invalid pId value in incrPlayCounter:',
        typeof p.pId,
        p.pId
      );
      console.log('from user agent: ', getShortUserAgent());
      return cb && cb({ error: 'invalid pId' });
    }
    p.logData = p.logData || {};
    function getShortUserAgent() {
      var userAgent =
        request && request.headers && request.headers['user-agent'];
      return userAgent ? getBrowserVersionFromUserAgent(userAgent) : undefined;
    }
    function callbackAndLogPlay(post) {
      cb && cb({ result: post });
      if (!post || !post.name) return;
      if (p.duration > 0) post.duration = p.duration;
      if (!p.logData.err)
        lastFm.updateNowPlaying2(
          post,
          (mongodb.usernames[p.uId].lastFm || {}).sk,
          function () {
            //console.log("-> last fm response", res);
          }
        );
    }
    if (p.logData.err) postModel.fetchPostById(p.pId, callbackAndLogPlay);
    else postModel.incrPlayCounter(p.pId, callbackAndLogPlay);
  },
  scrobble: function (p, cb) {
    if (!p.uId) return cb && cb({ error: 'not logged in' });
    postModel.fetchPostById(p.pId, function (r) {
      if (!r) return cb && cb({ error: 'missing track' });
      var lastFmSessionKey = (mongodb.usernames[p.uId].lastFm || {}).sk;
      lastFm.scrobble2(
        r && r.name,
        lastFmSessionKey,
        p.uId == r.uId,
        p.timestamp,
        function (res) {
          //console.log("-> last fm response", res);
          cb && cb(res);
        }
      );
    });
  },
};

exports.handleRequest = function (request, reqParams, response, features) {
  request.logToConsole('api.post.handleRequest', reqParams);

  function resultHandler(res, args) {
    if (!res || res.error)
      console.log(
        /*reqParams,*/ 'api.post.' + reqParams.action,
        ' RESULT =>',
        res
      );
    response.legacyRender(
      res,
      null,
      args || { 'content-type': 'application/json' }
    );
  }

  var user = request.getUser() || {}; //checkLogin(response);
  reqParams.uId = user.id;
  reqParams.uNm = user.name;

  if (reqParams.action && publicActions[reqParams.action])
    return publicActions[reqParams.action](reqParams, resultHandler);

  // make sure a registered user is logged, or return an error page
  if (!user || !user.id) return response.badRequest();

  if (reqParams.action && exports.actions[reqParams.action])
    exports.actions[reqParams.action](
      reqParams,
      resultHandler,
      request,
      features
    );
  else response.badRequest();
};

exports.controller = function (request, getParams, response, features) {
  //request.logToConsole("api.post", getParams);
  var params = snip.translateFields(getParams || {}, sequencedParameters);

  //if (request.method.toLowerCase() === 'post')
  for (let i in request.body) params[i] = request.body[i];

  exports.handleRequest(request, params, response, features);
};

function extractPlaylistRequest(httpParams) {
  try {
    return typeof httpParams.pl == 'object'
      ? httpParams.pl
      : JSON.parse(httpParams.pl);
  } catch (e) {
    return {
      id: httpParams['pl[id]'],
      name: httpParams['pl[name]'],
    };
  }
}

const needToCreatePlaylist = (playlistRequest) =>
  playlistRequest.id == 'create';
