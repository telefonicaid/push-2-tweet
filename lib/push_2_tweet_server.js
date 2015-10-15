/*
 * Copyright 2015 Telefónica Investigación y Desarrollo, S.A.U
 *
 * This file is part of push-2-tweet
 *
 * push-2-tweet is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * push-2-tweet is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with push-2-tweet.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[german.torodelvalle@telefonica.com]
 */

'use strict';

var p2tLogger = require('logops'),
    p2tConfig = require('./push_2_tweet_configuration'),
    p2tComm = require('./push_2_tweet_communication'),
    p2tHelper = require('./push_2_tweet_helper.js'),
    hapi = require('hapi'),
    boom = require('boom'),
    async = require('async'),
    Twitter = require('twitter');

var server;

var attendedRequests = 0;

var twitter = new Twitter({
  'consumer_key': p2tConfig.TWITTER_CONSUMER_KEY,
  'consumer_secret': p2tConfig.TWITTER_CONSUMER_SECRET,
  'access_token_key': p2tConfig.TWITTER_ACCESS_TOKEN_KEY,
  'access_token_secret': p2tConfig.TWITTER_ACCESS_TOKEN_SECRET
});

/**
 * Checks that every request sent to the Push 2 Tweet includes the required headers
 * @param {object} value Headers object
 * @param {object} options Hapi server header validation configuration object
 * @param {function} next Hapi server header validation continuation function
 */
function validateHeaders(value, options, next) {
  var error, message;

  var context = {
    corr: value[p2tConfig.UNICA_CORRELATOR_HEADER] || p2tHelper.getUnicaCorrelator(),
    trans: p2tHelper.getTransactionId(),
    op: p2tHelper.getOperationType()
  };

  attendedRequests++;

  if (!value['fiware-service']) {
    message = 'error=child "fiware-service" fails because [fiware-service is required]';
    p2tLogger.warn(
      context,
      message
    );
    error = boom.badRequest(message);
    error.output.payload.validation = {source: 'headers', keys: ['fiware-service']};
    next(error);
  } else if (!value['fiware-servicepath']) {
    message = 'child "fiware-servicepath" fails because [fiware-servicepath is required]';
    p2tLogger.warn(
      context,
      message
    );
    error = boom.badRequest(message);
    error.output.payload.validation = {source: 'headers', keys: ['fiware-servicepath']};
    next(error);
  }
  next();
}

/**
 * Handler to manage the requests for the version of the component
 * @param {Object} request The received request
 * @param {Function} reply The reply function to respond to the requester
 * @return {*} Returns the version of the Push 2 Tweet component
 */
function getVersionHandler(request, reply) {
  var message = p2tHelper.getVersion();
  return reply(message);
}

/**
 * Returns the logging context associated to a request
 * @param {Object} request The updateContext request received
 * @return {Object} The context to be used for logging
 */
function getContext(request) {
  return {
    corr: request.headers[p2tConfig.UNICA_CORRELATOR_HEADER] ||
            p2tHelper.getUnicaCorrelator(request),
    trans: p2tHelper.getTransactionId(),
    op: p2tHelper.getOperationType(request)
  };
}

/**
 * Attends a received request
 * @param request The received request
 * @param callback Callback to be notified when the request has been processed
 */
function processOperationRequest(request, callback) {
  twitter.post(
    'statuses/update',
    {
      status: '(TESTING) Button with id: \'' + request.push2Tweet.operationDescriptor.button + '\'' +
      ', action: \'' + request.push2Tweet.operationDescriptor.action + '\'' +
      ' and extra: \'' + request.push2Tweet.operationDescriptor.extra + '\' has just been pushed!'
    },
    function(err, tweet, response){
      if (err && callback) {
        return callback(err);
      } else {
        p2tLogger.info(request.push2Tweet.context, 'Tweet published: \'' + tweet.text + '\'');
        request.push2Tweet.result = {
          code: 'TWEET_SUCCESSFULLY_PUBLISHED',
          tweet: tweet,
          response: response
        };
        if (callback) {
          return callback();
        }
      }
    }
  );
}

/**
 * Error handler in case an error occurs during the request processing
 * @param request The received request
 * @param reply hapi's reply() function
 * @param err The error which occurred
 */
function requestErrorHandler(request, reply, err) {
  if (err) {
    p2tComm.respond2Request(err, request, reply);
  }
}

/**
 * Handler to manage requests
 * @param {Object} request The received request
 * @param {Function} reply The reply function to respond to the requester
 */
function requestHandler(request, reply) {
  request.push2Tweet = request.push2Tweet || {};
  request.push2Tweet.context = getContext(request);

  p2tLogger.debug(
    request.push2Tweet.context,
    'new request received: ' +
      JSON.stringify(request.payload)
  );

  async.waterfall([
    p2tComm.getOperationDescriptor.bind(null, request),
    processOperationRequest.bind(null, request),
    p2tComm.respond2Request.bind(null, null, request, reply)
  ], requestErrorHandler.bind(null, request, reply));
}

/**
 * Starts the server asynchronously
 * @param {string} host The Push 2 Tweet server host
 * @param {string} port The Push 2 Tweet server port
 * @param {Function} callback Callback function to notify the result
 *  of the operation
 */
function start(host, port, callback) {
  var context = {
    op: p2tConfig.OPERATION_TYPE.SERVER_LOG
  };

  server = new hapi.Server();

  server.on('log', function(event, tags) {
    if (tags.load) {
      p2tLogger.warn(context, 'event=' + JSON.stringify(event));
    }
  });

  server.on('request-internal', function(request, event, tags) {
    if (tags.error) {
      if (tags.auth || tags.handler || tags.state || tags.payload || tags.validation) {
        p2tLogger.warn(context, request.method.toUpperCase() + ' ' + request.url.path +
          ', event=' + JSON.stringify(event)
        );
      } else {
        p2tLogger.error(context, request.method.toUpperCase() + ' ' + request.url.path +
          ', event=' + JSON.stringify(event)
        );
      }
    }
  });

  server.connection({
    host: host,
    port: port
  });

  server.route([
    {
      method: 'GET',
      path: '/version',
      handler: getVersionHandler
    },
    {
      method: 'POST',
      path: p2tConfig.P2T_PATH + '/async/create',
      handler: requestHandler,
      config: {
        validate: {
          headers: validateHeaders
        }
      }
    },
    {
      method: 'POST',
      path: p2tConfig.P2T_PATH + '/sync/request',
      handler: requestHandler,
      config: {
        validate: {
          headers: validateHeaders
        }
      }
    }
  ]);

  // Start the server
  server.start(function(err) {
    return callback(err, server);
  });
}

/**
 * Stops the server asynchronously
 * @param {Function} callback Callback function to notify the result
 *  of the operation
 */
function stop(callback) {
  var context = {
    operationType: p2tConfig.OPERATION_TYPE.SERVER_STOP
  };

  p2tLogger.info(
    context,
    'Stopping the Push 2 Tweet server...'
  );

  if (server && server.info && server.info.started) {
    server.stop(function(err) {
      // Server successfully stopped
      p2tLogger.info(
        context,
        'HTTP server (hapi) successfully stopped'
      );

      if (callback) {
        process.nextTick(callback.bind(null, err));
      }
    });
  } else {
    p2tLogger.info(
      context,
      'No HTTP server (hapi) running'
    );

    if (callback) {
      process.nextTick(callback);
    }
  }
}

/**
 * Returns the server KPIs
 * @return {{attendedRequests: number}}
 */
function getKPIs() {
  return {
    attendedRequests: attendedRequests
  };
}

/**
 * Resets the server KPIs
 */
function resetKPIs() {
  attendedRequests = 0;
}

/**
 * Properties and functions exported by the module
 * @type {{server, startup: startup, exitGracefully: exitGracefully}}
 */
module.exports = {
  get hapiServer() {
    return server;
  },
  start: start,
  stop: stop,
  getKPIs: getKPIs,
  resetKPIs: resetKPIs
};
