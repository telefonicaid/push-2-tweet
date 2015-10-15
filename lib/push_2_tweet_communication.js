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

var p2tConfig = require('./push_2_tweet_configuration'),
  p2tLogger = require('logops'),
  p2tHelper = require('./push_2_tweet_helper'),
  caErrors = require('./push_2_tweet_error'),
  sendRequest = require('request'),
  revalidator = require('revalidator'),
  payloadJSONSchema = require('./schema/request-payload-schema.json');

/**
 * Checks that a request sent to the Push 2 Tweet is well-formed
 * @param {object} request The request sent to the Push 2 Tweet
 * @param {function} callback Callback to be called with the result of the check
 * @return {*} boolean True if the updateContext request is valid. False otherwise
 */
function checkRequest(request, callback) {
  var payloadJSON;

  if (typeof(request.payload) === 'string') {
    try {
      payloadJSON = JSON.parse(request.payload);
    } catch (err) {
      p2tLogger.warn(request.push2Tweet.context, 'Error when parsing the request payload: ' + request.payload +
        (err.message ? ', error=' + err : '')
      );
      return process.nextTick(callback.bind(null, err));
    }
  } else {
    payloadJSON = request.payload;
  }
  var validation = revalidator.validate(payloadJSON, payloadJSONSchema);
  if (validation.valid) {
    p2tLogger.debug(request.push2Tweet.context, 'The request payload: ' + request.payload + ' is valid');
    return process.nextTick(callback);
  } else {
    var err = new caErrors.BadPayload(
      request.payload
    );
    err.message += ' (errors: ' + p2tHelper.stringifyRevalidatorErrors(validation.errors) + ')';
    p2tLogger.warn(request.push2Tweet.context, 'The request payload: ' + request.payload + ' is NOT valid' +
      (err.message ? ', error=' + JSON.stringify(err) : '')
    );
    return process.nextTick(callback.bind(null, err));
  }
}

/**
 * Processes and returns the requested operation information
 * @param {object} request The updateContext request received
 * @param {function} callback Callback to be called with the result of the operation
 */
function getOperationDescriptor(request, callback) {
  checkRequest(request, function(err) {
    if (err) {
      return process.nextTick(callback.bind(null, err));
    } else {
      var payloadJSON = JSON.parse(request.payload);
      var operationDescriptor = {
        button: payloadJSON.button,
        action: payloadJSON.action,
        extra: payloadJSON.extra,
        callback: payloadJSON.callback
      };
      request.push2Tweet.operationDescriptor = operationDescriptor;
      return process.nextTick(callback);
    }
  });
}

/**
 * Responds to the received request
 * @param err Error in case an error ocurred during the processing
 * @param request The received request
 * @param reply hapi's reply() function
 * @param callback A callback to notify whenthe operation has finished
 * @return {*} This function does not return anything of value
 */
function respond2Request(err, request, reply, callback) {
  var response = {
    externalId: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
    buttonId: (request && request.push2Tweet && request.push2Tweet.operationDescriptor &&
      request.push2Tweet.operationDescriptor.button) || 'unknown'
  };
  if (err) {
    response.details = {
      code: err.code || Array.isArray(err) && err[0].code || 'ERROR',
      message: err.message || Array.isArray(err) && err[0].message || 'Some error occured when sending the tweet'
    };
    p2tLogger.warn(request.push2Tweet.context, 'Responding to the request ' + request.method.toUpperCase() + ' ' +
      request.url.path + ' and payload: ' + request.payload +
      ' with the following response: ' + JSON.stringify(response)
    );
    reply(response);
  } else {
    response.details = {
      code: request.push2Tweet.result.code,
      tweet: request.push2Tweet.result.tweet
    };
    p2tLogger.debug(request.push2Tweet.context, 'Responding to the request ' + request.method.toUpperCase() + ' ' +
      request.url.path + ' and payload: ' + request.payload +
      ' with the following response: ' + JSON.stringify(response)
    );
    if (request.push2Tweet.operationDescriptor.callback) {
      reply();
      setTimeout(function() {
        var requestOptions = {
          method: 'POST',
          uri: request.push2Tweet.operationDescriptor.callback,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Fiware-Service': request.headers['fiware-service'],
            'Fiware-ServicePath': request.headers['fiware-servicepath']
          },
          json: true,
          body: response
        };
        sendRequest(requestOptions);
      }, parseInt(p2tConfig.RESPONSE_TIMEOUT, 10));
    } else {
      reply(response);
    }
  }
  if (callback) {
    return process.nextTick(callback);
  }
}

module.exports = {
  getOperationDescriptor: getOperationDescriptor,
  respond2Request: respond2Request
};
