
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

exports.topTen = function(req, res, next){
    res.send('Hello Fuseday');
}

exports.getTopHashtags = function(req, res, next){
    var time = req.query.time;
    var limit = 10;
    dataService.getTopHashtags(time, limit, function(err, tags){
       if(err){
           return next(err);
       }
        res.send(tags);
    });
}