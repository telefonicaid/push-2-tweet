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

/**
 * The Push 2 Tweet supports 2 ways of configuration:
 *  1. Via environment variables.
 *  2. Vía de config.js file found in the root of the application
 * Any of the supported configuration options can be configured using any of these 2 means.
 * Anyhow, it is important to note that environment variables take precedence over configuration
 *  using the config.js file in case of collisions.
 */
'use strict';

var config = require('../config.js');

var ENV = process.env;

/**
 * Constants exported by the module
 */
module.exports = {
  OPERATION_ACTION: 'action',
  INTERACTION_TYPE: 'interaction_type',
  INTERACTION_TYPES: {
    SYNCHRONOUS: 'synchronous',
    ASYNCHRONOUS: 'asynchronous'
  },
  OPERATION_EXTRA: 'aux_op_extra',
  UNICA_CORRELATOR_HEADER: 'unica-correlator',
  UNICA_CORRELATOR: {
    NOT_AVAILABLE: 'NA'
  },
  OPERATION_TYPE_PREFIX: 'OP_P2T_',
  TRANSACTION_ID: {
    NOT_AVAILABLE: 'NA'
  },
  OPERATION_TYPE: {
    NOT_AVAILABLE: 'NA',
    STARTUP: 'OP_P2T_STARTUP',
    SHUTDOWN: 'OP_P2T_SHUTDOWN',
    SERVER_START: 'OP_P2T_SERVER_START',
    SERVER_LOG: 'OP_P2T_SERVER_LOG',
    SERVER_STOP: 'OP_P2T_SERVER_STOP'
  }
};

/**
 * Log level configuration property exported by the module
 * @type {string|*}
 */
module.exports.LOGOPS_LEVEL = ENV.LOGOPS_LEVEL || config.logging.level || 'INFO';
if (!isNaN(ENV.PROOF_OF_LIFE_INTERVAL)) {
  /**
   * Proof of life interval configuration property
   * @type {*|string}
   */
  module.exports.PROOF_OF_LIFE_INTERVAL = ENV.PROOF_OF_LIFE_INTERVAL;
} else if (config.logging && !isNaN(config.logging.proofOfLifeInterval)) {
  /**
   * Proof of life interval configuration property
   * @type {*|string}
   */
  module.exports.PROOF_OF_LIFE_INTERVAL = config.logging.proofOfLifeInterval;
} else {
  /**
   * Proof of life interval configuration property
   * @type {*|string}
   */
  module.exports.PROOF_OF_LIFE_INTERVAL = '60';
}

/**
 * Default service configuration property exported by the module
 * @type {string|*}
 */
module.exports.DEFAULT_SERVICE = ENV.DEFAULT_SERVICE || config.server.defaultService || 'blackbutton';
/**
 * Default service path configuration property exported by the module
 * @type {*|string}
 */
module.exports.DEFAULT_SERVICE_PATH = ENV.DEFAULT_SERVICE_PATH ||
  (config.server && config.server.defaultServicePath) || '/';

/**
 * Push 2 Tweet host configuration property exported by the module
 * @type {string|*}
 */
module.exports.P2T_HOST = ENV.P2T_HOST || config.server.host || 'localhost';
if (!isNaN(ENV.P2T_PORT)) {
  /**
   * Push 2 Tweet port configuration property exported by the module
   * @type {Number}
   */
  module.exports.P2T_PORT = parseInt(ENV.P2T_PORT, 10);
} else if (config.server && !isNaN(config.server.port)) {
  /**
   * Push 2 Tweet port configuration property exported by the module
   * @type {Number}
   */
  module.exports.P2T_PORT = parseInt(config.server.port, 10);
} else {
  /**
   * Push 2 Tweet port configuration property exported by the module
   * @type {number}
   */
  module.exports.P2T_PORT = 6666;
}
if (ENV.P2T_PATH && ENV.P2T_PATH.charAt(0) === '/') {
  /**
   * Push 2 Tweet path configuration property exported by the module
   * @type {*|string}
   */
  module.exports.P2T_PATH = ENV.P2T_PATH;
} else if (config.server && config.server.path && config.server.path.charAt(0) === '/') {
  /**
   * Push 2 Tweet path configuration property exported by the module
   * @type {string}
   */
  module.exports.P2T_PATH = config.server.path;
} else {
  /**
   * Push 2 Tweet path configuration property exported by the module
   * @type {string}
   */
  module.exports.P2T_PATH = '/v1';
}

/**
 * Default service path configuration property exported by the module
 * @type {*|string}
 */
module.exports.RESPONSE_TIMEOUT = ENV.RESPONSE_TIMEOUT ||
  (config.server && config.server.responseTimeout) || '3000';

/**
 * Twitter consumer key configuration
 * @type {string}
 */
module.exports.TWITTER_CONSUMER_KEY = config.twitter.consumerKey || '';
/**
 * Twitter consumer key configuration
 * @type {string}
 */
module.exports.TWITTER_CONSUMER_SECRET = config.twitter.consumerSecret || '';
/**
 * Twitter consumer key configuration
 * @type {string}
 */
module.exports.TWITTER_ACCESS_TOKEN_KEY = config.twitter.accessTokenKey || '';
/**
 * Twitter consumer key configuration
 * @type {string}
 */
module.exports.TWITTER_ACCESS_TOKEN_SECRET = config.twitter.accessTokenSecret || '';
