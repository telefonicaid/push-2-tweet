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
    p2tPackage = require('../package.json');

/**
 * Generates a 32 bit integer hash code
 * @param {string} str The seed
 * @return {number} The hash code
 */
function getHashCode(str) {
  var hash = 0, i, chr, len;
  if (str && str.length === 0) {
    return hash;
  }
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Generates the UNICA correlator based on a request
 * @param {object} request The HTTP request
 * @return {string} The generated UNICA correlator
 */
function getUnicaCorrelator(request) {
  if (!request) {
    return p2tConfig.UNICA_CORRELATOR.NOT_AVAILABLE;
  } else {
    return getHashCode('from: ' + request.info.remoteAddress +
      ':' + request.info.remotePort +
      ', method: ' + request.method.toUpperCase() +
      ', url: ' + request.url.path);
  }
}

/**
 * Generates the transaction identifier to be used when for logging
 * @return {string} The generated transaction id
 */
function getTransactionId() {
  return new Date().getTime();
}

/**
 * Returns the operation type for a concrete request to be used for logging
 * @param {object} request The request
 * @return {string} The operation type
 */
function getOperationType(request) {
  if (!request) {
    return p2tConfig.OPERATION_TYPE.SERVER_LOG;
  } else {
    return p2tConfig.OPERATION_TYPE_PREFIX + request.method.toUpperCase();
  }
}

/**
 * Returns version information about this concrete instance of the
 *  Push 2 Tweet component
 * @return {object} A JSON-formatted object including the version information
 */
function getVersion() {
  var message = {};
  if (p2tPackage) {
    if (p2tPackage.version) {
      message.version = p2tPackage.version;
    }
  }
  if (Object.getOwnPropertyNames(message).length === 0) {
    message.version = 'No version information available';
  }
  return message;
}

/**
 * Parses the errors array returned by the revalidation object
 * @param {Array} errors The errors array
 * @return {string} The parsed errors as a string
 */
function stringifyRevalidatorErrors(errors) {
  var errorsAsStr = '',
    counter = 0;
  errors.forEach(function(error) {
    counter++;
    if (counter > 1) {
      errorsAsStr += ', ';
    }
    errorsAsStr += error.property + ' ' + error.message;
  });
  return errorsAsStr;
}

/**
 * Properties and functions exported by the module
 * @type {{getUnicaCorrelator: getUnicaCorrelator, getTransactionId: getTransactionId,
 * getOperationType: getOperationType, getVersion: getVersion, getAttributeValue: getAttributeValue,
 * setAttribute: setAttribute, removeAttribute: removeAttribute}}
 */
module.exports = {
  getUnicaCorrelator: getUnicaCorrelator,
  getTransactionId: getTransactionId,
  getOperationType: getOperationType,
  getVersion: getVersion,
  stringifyRevalidatorErrors: stringifyRevalidatorErrors
};
