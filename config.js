/*
 * Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
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

(function() {
  'use strict';

  var config = {};

// Push 2 Tweet server configuration
//--------------------------
  config.server = {
    // The host where the Push 2 Tweet server will be started. Default value: "localhost".
    host: 'localhost',
    // The port where the Push 2 Tweet server will be listening. Default value: "8777".
    port: '8777',
    // The path where the Push 2 Tweet server will be expecting requests. Default value: "/v1".
    path: '/v1',
    // Response asynchronous timeout
    responseTimeout: '3000',
    // The service to be used if not sent by the Context Broker in the interchanged messages.
    //  Default value: "blackbutton".
    defaultService: 'blackbutton',
    // The service path to be used if not sent by the Context Broker in the interchanged messages.
    //  Default value: "/".
    defaultServicePath: '/'
  };

// Logging configuration
//------------------------
  config.logging = {
    // The logging level of the messages. Messages with a level equal or superior to this will be logged.
    //  Accepted values are: "DEBUG", "INFO", "WARN", "ERROR" and "FATAL". Default value: "INFO".
    level: 'INFO',
    // The time in seconds between proof of life logging messages informing that the server is up and running normally.
    //  Default value: "60"
    proofOfLifeInterval: '60'
  };

// Twitter configuration
//------------------------
  config.twitter = {
    consumerKey: '',
    consumerSecret: '',
    accessTokenKey: '',
    accessTokenSecret: '',
    status: [
      // Possible variables to use in the Twitter statuses are:
      //  #button: it will be substituted by the value of the button property received in the request
      //  #action: it will be substituted by the value of the action property received in the request
      //  #extra: it will be substituted by the value of the extra property received in the request
      //  #date: it will be substituted by the current date
      'Se ha pulsado el bóton "#button" el #date',
      'Acaba de pulsar el bóton "#button" el #date',
      'Tremenda pulsación en el bóton "#button" el #date',
      'Hemos recibido un click muy fuerte en el bóton "#button" el #date',
      'Gran pulsación en el bóton "#button" el #date'
    ]
  };

  module.exports = config;
})();
