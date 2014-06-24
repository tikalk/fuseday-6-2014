/**
 * Created by assaf on 6/24/14.
 */

'use strict';

var redis = require("redis");

/**
 *
 * @param redisConf
 */
module.exports = function(redisConf){
    var client = redis.createClient(redisConf.port, redisConf.host, redisConf.options);

    client.on("error", function (err) {
        console.log("Error " + err);
    });

    this.getTopTweetsEver = function(limit, callback){
        redis.get(['trend','top', 'ever'].join(':'), callback);
    }
};