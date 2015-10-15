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

var p2tLogger = require('logops');
var p2tConfig = require('./push_2_tweet_configuration');
var p2tHelper = require('./push_2_tweet_helper');
var p2tServer = require('./push_2_tweet_server');

var isStarted = false, proofOfLifeInterval;

/**
 * Gracefully stops the application, stopping the server after completing
 *  all the pending requests
 * @param {Error} err The error provoking the exit if any
 * @param {Function} callback The callback to be notified once the app exits gracefully
 */
function exitGracefully(err, callback) {
  function onStopped() {
    isStarted = false;
    var exitCode = 0;
    if (err) {
      exitCode = 1;

    } else {
      p2tLogger.info(
        {
          op: p2tConfig.OPERATION_TYPE.SHUTDOWN
        },
        'Application exited successfully');
    }
    if (callback) {
      callback(err);
    }
    // TODO:
    // Due to https://github.com/winstonjs/winston/issues/228 we use the
    //  setTimeout() hack. Once the issue is solved, we will fix it.
    setTimeout(process.exit.bind(null, exitCode), 500);
  }

  if (err) {
    var message = err.toString();
    if (message.indexOf('listen EADDRINUSE') !== -1) {
      message += ' (another Push 2 Tweet instance maybe already listening on the same port)';
    }
    p2tLogger.error(
      {
        op: p2tConfig.OPERATION_TYPE.SHUTDOWN
      },
      message
    );
  }

  if (proofOfLifeInterval) {
    clearInterval(proofOfLifeInterval);
  }
  p2tServer.stop(onStopped);
}

/**
 * Enables the proof of life logging
 */
function enableProofOfLifeLogging() {
  proofOfLifeInterval = setInterval(function () {
    p2tLogger.info(
      {
        op: p2tConfig.OPERATION_TYPE.SERVER_LOG
      },
      'Everything OK, %d requests attended in the last %ds interval...',
      p2tServer.getKPIs().attendedRequests,
      p2tConfig.PROOF_OF_LIFE_INTERVAL);
    p2tServer.resetKPIs();
  }, parseInt(p2tConfig.PROOF_OF_LIFE_INTERVAL, 10) * 1000);
}

/**
 * Convenience method to start the Push 2 Tweet component up as a running
 *  Node.js application or via require()
 * @param {Function} callback Callback function to notify when start up process
 *  has concluded
 * @return {*} Returns nothing
 */
function start(callback) {
  if (isStarted) {
    if (callback) {
      return process.nextTick(callback);
    }
  }

  p2tLogger.setLevel(p2tConfig.LOGOPS_LEVEL);

  var version = p2tHelper.getVersion();
  p2tLogger.info(
    {
      op: p2tConfig.OPERATION_TYPE.STARTUP
    },
    'Starting up Push 2 Tweet server version %s...',
    version.version
  );
  p2tLogger.debug(
    {
      op: p2tConfig.OPERATION_TYPE.STARTUP
    },
    'Push 2 Tweet configuration: \n',
    p2tConfig
  );

  // Start the hapi server
  p2tServer.start(
    p2tConfig.P2T_HOST, p2tConfig.P2T_PORT, function(err) {
      if (err) {
        p2tLogger.error(
          {
            op: p2tConfig.OPERATION_TYPE.SERVER_START
          },
          err);
        // Error when starting the server
        return exitGracefully(err, callback);
      } else {
        isStarted = true;
        p2tLogger.info(
          {
            op: p2tConfig.OPERATION_TYPE.SERVER_START
          },
          'Server started at %s...', p2tServer.hapiServer.info.uri);


        enableProofOfLifeLogging();

        if (callback) {
          return process.nextTick(callback);
        }
      }
    }
  );
}

/**
 * Convenience method to stop the Push 2 Tweet
 * @param callback Function to be called when the Push 2 Tweet stops
 * @return {*}
 */
function stop(callback) {
  if (isStarted) {
    return p2tServer.stop(callback);
  }
  if (callback) {
    return process.nextTick(callback);
  }
}

// In case Control+C is clicked, exit gracefully
process.on('SIGINT', function() {
  return exitGracefully(null);
});

// In case of an uncaught exception exists gracefully
process.on('uncaughtException', function(exception) {
  return exitGracefully(exception);
});

/**
 * Properties and functions exported by the module
 * @type {{server, start: start, stop: stop, exitGracefully: exitGracefully}}
 */
module.exports = {
  get server() {
    return p2tServer;
  },
  start: start,
  stop: stop,
  exitGracefully: exitGracefully
};
