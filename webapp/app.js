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
    morgan  = require('morgan'),
    index  = require('./routes/index'),
    cpuCount = require('os').cpus().length; // Count the machine's CPUs

var serverInerface - require('server-interface');


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



    //

    app.get('/', index.home);

    // API section

    app.get('/api/top/:type/:count', function(req,res){
        var type = req.param('type');
        var count = req.param('count');
        serverInterface.getTop( type, count, {});
    });

    app.post('/api/top/:type/:count', function(req,res){
        var filter = req.body.param('filter');
        var type = req.param('type');
        var count = req.param('count');
        serverInterface.getTop( type, count, filter);

    });

    app.post('api/entries', function(req,res){
        var entries = req.body.entries;
        serverInterface.getEntities( entries);
    });
    // -----------------------------------


    http.createServer(app).listen(app.get('port'), function () {
        logger.info("Express server listening on port " + app.get('port'));
    });


}