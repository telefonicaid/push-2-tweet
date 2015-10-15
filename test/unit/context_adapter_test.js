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

var push2Tweet = require('../../lib/push_2_tweet');
var p2tConfig = require('../../lib/push_2_tweet_configuration');
var testHelper = require('./context_adapter_test_helper');
var hapi = require('hapi');
var request = require('request');

console.log('*** Running the Push 2 Tweet unit tests with the following configuration:');
console.log(p2tConfig);

describe('Push 2 Tweet server:', function() {
  it('should stop the Push 2 Tweet although not started:', function(done) {
    push2Tweet.stop(function(err) {
      expect(err).to.equal(undefined);
      done();
    });
  });

  it('should start the Push 2 Tweet:', function(done) {
    push2Tweet.start(function(err) {
      expect(err).to.equal(undefined);
      expect(push2Tweet.server.hapiServer).to.be.an.instanceof(hapi.Server);
      done();
    });
  });

  it ('should stop the Push 2 Tweet when started:', function(done) {
    push2Tweet.stop(function(err) {
      expect(err).to.equal(undefined);
      expect(push2Tweet.server.hapiServer.info.started).to.equal(0);
      done();
    });
  });

  it('should stop the Push 2 Tweet server although not started', function(done) {
    push2Tweet.server.stop(function(err) {
      expect(err).to.equal(undefined);
      done();
    });
  });

  it('should start the Push 2 Tweet server', function(done) {
    push2Tweet.server.start(p2tConfig.P2T_HOST, p2tConfig.P2T_PORT, function(err, hapiServer) {
      expect(err).to.equal(undefined);
      expect(hapiServer).to.be.an.instanceof(hapi.Server);
      expect(hapiServer).to.be.equal(push2Tweet.server.hapiServer);
      done();
    });
  });

  describe('HTTP methods:', function() {
    it('should respond with 404 - Not Found if invalid HTTP method', function(done) {
      request(
        testHelper.getRequestOptions(
          {
            method: 'PUT'
          }
        ),
        function(err, response, body) {
          expect(err).to.equal(null);
          expect(response.statusCode).to.equal(404);
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          done();
        }
      );
    });

  });

  describe('Headers:', function() {
    it('should respond with 400 - Bad Request if missing Fiware-Service header', function(done) {
      request(
        testHelper.getRequestOptions(
          {
            headers: ['Fiware-Service']
          }
        ),
        function(err, response, body) {
          expect(err).to.equal(null);
          expect(response.statusCode).to.equal(400);
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('Bad Request');
          done();
        }
      );
    });

    it('should respond with 400 - Bad Request if missing Fiware-ServicePath header', function(done) {
      request(
        testHelper.getRequestOptions(
          {
            headers: ['Fiware-ServicePath']
          }
        ),
        function(err, response, body) {
          expect(err).to.equal(null);
          expect(response.statusCode).to.equal(400);
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('Bad Request');
          done();
        }
      );
    });
  });

  describe('Routes:', function() {
    it('should respond with 404 - Not Found if invalid route', function(done) {
      request(
        testHelper.getRequestOptions(
          {
            uri: 'http://' + p2tConfig.P2T_HOST + ':' + p2tConfig.P2T_PORT +
            p2tConfig.P2T_PATH + '/invalidPath'
          }
        ),
        function(err, response, body) {
          expect(err).to.equal(null);
          expect(response.statusCode).to.equal(404);
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          done();
        }
      );
    });
  });

  describe('requests:', function() {
    it('should respond with a 400 code and BAD_PAYLOAD reasonPhrase if empty payload', function(done) {
      request(
        testHelper.getRequestOptions(),
        function(err, response, body) {
          expect(err).to.equal(null);
          expect(response.statusCode).to.equal(200);
          expect(body.details.code.indexOf('BAD_PAYLOAD')).to.equal(0);
          done();
        }
      );
    });

    it('should respond with a 400 code and BAD_PAYLOAD reasonPhrase if no button property',
      function(done) {
        request(
          testHelper.getRequestOptions(
            {
              body: testHelper.getRequestPayload({
                button: false
              })
            }
          ),
          function(err, response, body) {
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(200);
            expect(body.details.code.indexOf('BAD_PAYLOAD')).to.equal(0);
            done();
          }
        );
      }
    );

    it('should respond with a 400 code and BAD_PAYLOAD reasonPhrase if no action property',
      function(done) {
        request(
          testHelper.getRequestOptions(
            {
              body: testHelper.getRequestPayload({
                action: false
              })
            }
          ),
          function(err, response, body) {
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(200);
            expect(body.details.code.indexOf('BAD_PAYLOAD')).to.equal(0);
            done();
          }
        );
      }
    );

    it('should respond with a 400 code and BAD_PAYLOAD reasonPhrase if no extra property',
      function(done) {
        request(
          testHelper.getRequestOptions(
            {
              body: testHelper.getRequestPayload({
                extra: false
              })
            }
          ),
          function(err, response, body) {
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(200);
            expect(body.details.code.indexOf('BAD_PAYLOAD')).to.equal(0);
            done();
          }
        );
      }
    );

    describe('Synchronous requests:', function() {
      // TODO Synchronous requests tests pending including nocking the Twitter API
    });

    describe('Asynchronous requests:', function() {
      // TODO Asynchronous requests tests pending including nocking the Twitter API
    });
  });
});
