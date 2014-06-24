
'use strict';

var DataService = require('../lib/DataService'),
    argv = require('optimist')
        .usage('Usage: $0 -redisPort [num] -redisHost [num]')
        .demand(['redisPort','redisHost']).argv;

var redisConf = {
    port: argv.redisPort,
    host: argv.redisHost
};

var dataService = new DataService(redisConf);

exports.home = function(req, res, next){
    res.send('Hello Fuseday');

}