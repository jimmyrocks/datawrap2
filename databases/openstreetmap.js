// TODO: Not entirely sure of the direction for this

var Promise = require('bluebird');
var request = require('superagent');
var fandlebars = require('fandlebars');
var OAuth = require('oauth').OAuth;
var tools = require('jm-tools');

// Oauthify superagent
require('superagent-oauth')(request);

var format = function (output) {
  // TODO: Clean up the output from this so it's similar to all other outputs
  return output;
};

var initialize = function (connectionConfig) {
  return new Promise(function (fulfill, reject) {
    // Create the OAuth Object
    var oauth = new OAuth(
      'http://' + connectionConfig.address + 'oauth/request_token',
      'http://' + connectionConfig.address + 'oauth/access_token',
      connectionConfig.consumer_key,
      connectionConfig.consumer_secret, '1.0',
      null,
      'HMAC-SHA1'
    );

    // Get User Details /0.6/user/details
    request.get(connectionConfig.address + '0.6/user/details.json')
      .sign(oauth, connectionConfig.access_key, connectionConfig.access_secret)
      .end(function (err, res) {
        if (!err && res.status === 200) {
          fulfill({
            oauth: oauth,
            user: res.body,
            connection: connectionConfig
          });
        } else {
          console.log('^&^&^&^&^&^&^');
          console.log(err);
          console.log(connectionConfig);
          console.log('^&^&^&^&^&^&^');
          reject(new Error(err));
        }
      });
  });
};

module.exports = function (connectionConfig) {
  var initializedConnection;
  var returnObject = {
    query: function (query, updatedRow, primaryKeys, metadata) {
      return returnObject.verify().then(function (connection) {
        return new Promise(function (fulfill, reject) {
          console.log('&&&&&&&&&&&&&&&&&&&&&&&&& This is what i got');
          console.log(query, updatedRow, primaryKeys, metadata);
          console.log('&&&&&&&&&&&&&&&&&&&&&&&& ');
          /*
          var cleanedSql = fandlebars(query, params);
          var requestPath = 'https://' + connectionConfig.account + '.cartodb.com/api/v2/sql';

          if (cleanedSql.length > 5) {
            request .post(requestPath)
              .set('Content-Type', 'application/json')
              .set('Accept', 'application/json')
              .send({
                'q': cleanedSql,
                'api_key': connectionConfig.apiKey
              })
              .end(function (err, response) {
                if (err || response.error) {
                  reject(new Error(JSON.stringify(err || response, null, 2)));
                } else {
                  fulfill(returnRaw ? response : format(response));
                }
              });
          } else {
            reject('Query Too Short: (' + cleanedSql.length + ') chars');
          }
          */
          reject('stopping here');
        });
      });
    },
    verify: function () {
      // Tries to open the connection
      if (initializedConnection) {
        return tools.dummyPromise(initializedConnection);
      } else {
        return initialize(connectionConfig).then(function (connection) {
          initializedConnection = connection;
          return returnObject.verify();
        });
      }
    },
    close: function () {
      return returnObject.verify().then(function (connection) {
        return new Promise(function (fulfill, reject) {
          // Dummy function, cartodb connections close as soon as the query is done
          fulfill(true);
        });
      });
    }
  };
  return returnObject;
};
