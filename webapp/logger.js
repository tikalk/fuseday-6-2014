var winston = require('winston');


var logstashHost = process.env.LOGSTASH_HOST;
var logstashPort = process.env.LOGSTASH_PORT || 28777;

if(logstashHost){
    //
// Requiring `winston-logstash` will expose
// `winston.transports.Logstash`
//
    console.log('using logstash @ '+logstashHost+':'+logstashPort);
    require('winston-logstash');

    winston.add(winston.transports.Logstash, {
        port: logstashPort,
        node_name: 'location-manager',
        host: logstashHost  //'54.186.50.36'
    });


}


Object.defineProperty(global, '__stack', {
    get: function getter() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        var err = new Error();
        Error.captureStackTrace(err, getter);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__stackInfo', {
    get: function () {
        var stack = __stack[2];
        return {
            line: stack.getLineNumber(),
            method: stack.getFunctionName(),
            file: stack.getFileName()
        };
    }
});


function log(priority) {
    return function (message) {
        var stackInfo = __stackInfo;
        winston.log(priority, message, {service: 'location-manager-service', pid: process.pid,  priority: priority.toUpperCase(), file: [stackInfo.file, stackInfo.line].join(':'), method: stackInfo.method});
    };
}

exports.debug = log('debug');
exports.info = log('info');
exports.error = log('error');

