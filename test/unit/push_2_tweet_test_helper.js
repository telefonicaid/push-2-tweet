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

var p2tConfig = require('../../lib/push_2_tweet_configuration');

/**
 * Returns a valid and well-formed or invalid and not well-formed
 *  updateContext request depending on the options passed
 * @param {object} options Object including the properties which should
 *  be excluded from the final returned payload. For example, if options is:
 *  {
   *    contextElements: {
   *      id: false,
   *      isPattern: false,
   *      attributes: [
   *        p2tConfig.BUTTON_ENTITY.P2T_SERVICE_ID_ATTR_NAME
   *      ]
   *    },
   *    updateAction: false
   *  }
 *  the returned payload will not include an id, isPattern properties or
 *  the specified attributes in the contextElements entry, or an updateAction
 *  property.
 * @return {object} The updateContext request payload
 */
function getRequestPayload(options) {
  var payload = {
    button: '<button-id>',
    action: '<action>',
    extra: '<extra>',
    callback: '<callback>'
  };

  if (options) {
    if (options.button === false) {
      delete payload.button;
    }
    if (options.action === false) {
      delete payload.action;
    }
    if (options.extra === false) {
      delete payload.extra;
    }
    if (options.callback === false) {
      delete payload.callback;
    }
  }
  return payload;
}

/**
 * Returns a request options object to be passed to the request module
 * @param {object} options Object including configuration options to apply to
 *  the generated updateContext request. For example, if options is:
 *  {
   *    uri: 'http://domain.com/path',
   *    method: 'GET',
   *    headers: ['Fiware-Service']
   *    },
 *    body: { ... }
 *  }
 *  the returned updateContext request will include the passed uri, 'GET' as HTTP method
 *  and will not include the 'Fiware-Service ' header
 *  @return {object} The request module options
 */
function getRequestOptions(options) {
  options = options || {};
  var requestOptions = {
    uri: options.uri || 'http://' + p2tConfig.P2T_HOST + ':' + p2tConfig.P2T_PORT +
    p2tConfig.P2T_PATH + (options.interactionType === p2tConfig.INTERACTION_TYPES.SYNCHRONOUS ?
      '/sync/request' : '/async/create'),
    method: options.method || 'POST',
    headers: {
      'Fiware-Service': p2tConfig.DEFAULT_SERVICE,
      'Fiware-ServicePath': p2tConfig.DEFAULT_SERVICE_PATH
    },
    json: true,
    body: options.body || {}
  };
  if (options.headers) {
    options.headers.forEach(function(header) {
      delete requestOptions.headers[header];
    });
  }
  return requestOptions;
}

/**
 * Properties and functions exported by the module
 * @type {{server, startup: startup, exitGracefully: exitGracefully}}
 */
module.exports = {
  getRequestPayload: getRequestPayload,
  getRequestOptions: getRequestOptions
};
