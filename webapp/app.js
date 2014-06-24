/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    logger = require('./logger'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    cluster = require('cluster'),
    morgan = require('morgan'),
    index = require('./routes/index'),
    path = require('path'),
    cpuCount = require('os').cpus().length; // Count the machine's CPUs


var useCluster = process.env.USE_CLUSTER;

if (useCluster && cluster.isMaster) {

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    cluster.on('death', function (worker) {
        console.log('Worker ' + worker.pid + ' died.');
        logger.info('Worker ' + worker.pid + ' died.');
    });

// Code to run if we're in a worker process
} else {
    var app = express();

    app.set('port', process.env.PORT || 5000);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(morgan());
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        logger.error(err.stack);
        res.send(500, 'Something broke!');
    });
    app.use(express.static(path.join(__dirname, 'client', 'dist')));

    //app.get('/', index.home);

    app.get('/hashtags', index.getTopHashtags);



    app.post('/api/top/:type/:count', function (req, res) {
        var filter = req.body.param('filter') || {};
        var type = req.param('type');
        var count = req.param('count');
//        serverInterface.getTop(type, count, filter).then(function (results) {
//            res.send(results);
//        }, function (error) {
//            console.error(error);
//            res.status(500);
//        });
        items: [
            { id: "saasdasd", name: "name", score: 10},
            { id: "saasdasd1", name: "name1", score: 10},
            { id: "saasdasd2", name: "name2", score: 9},
            { id: "saasdasd3", name: "name3", score: 8},
            { id: "saasdasd4", name: "name4", score: 6},
            { id: "saasdasd5", name: "name5", score: 5},
            { id: "saasdasd6", name: "name6", score: 6},
            { id: "saasdasd7", name: "name7", score: 10},
            { id: "saasdasd8", name: "name8", score: 10}

        ];
        res.send(items);
    });

    app.post('api/entries', function (req, res) {
        var entryIds = req.body.entries;
//        serverInterface.getEntries(entryIds).then(function (results) {
//            res.send(results);
//        }, function (error) {
//            console.error(error);
//            res.status(500);
//        });
    });

    http.createServer(app).listen(app.get('port'), function () {
        logger.info("Express server listening on port " + app.get('port'));
    });


}