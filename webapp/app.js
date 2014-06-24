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
    q = require('q'),
    cpuCount = require('os').cpus().length; // Count the machine's CPUs

var serverInterface = require('server-interface');

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
        serverInterface.getTop( type, count, {}).then(function(results) {
            res.send(results);
        }, function(error) {
            console.error(error);
            res.status(500);
        });
    });

    app.post('/api/top/:type/:count', function(req,res){
        var filter = req.body.param('filter');
        var type = req.param('type');
        var count = req.param('count');
        serverInterface.getTop( type, count, filter).then(function(results) {
            res.send(results);
        }, function(error) {
            console.error(error);
            res.status(500);
        });;

    });

    app.post('api/entries', function(req,res){
        var entryIds = req.body.entries;
        serverInterface.getEntries( entryIds).then(function(results) {
            res.send(results);
        }, function(error) {
            console.error(error);
            res.status(500);
        });
    });
    // -----------------------------------


    http.createServer(app).listen(app.get('port'), function () {
        logger.info("Express server listening on port " + app.get('port'));
    });


