'use strict';

var request = require('request'),
    fs = require('fs');

module.exports = function (grunt) {
    var reloadPort = 35729, files;
    // Show elapsed time at the end
    require('time-grunt')(grunt);
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);


    grunt.initConfig({

            pkg: grunt.file.readJSON('package.json'),
            clean: {
                test: 'test-results'
            },
            jasmine_node: {
                coverage: {
                    report : ['lcov', 'cobertura' ],
                    savePath: 'test-results'
                },
                options: {
                    specFolders:['spec'],
                    forceExit: false,
                    match: '.',
                    matchall: false,
                    extensions: 'js',
                    specNameMatcher: 'spec',
                    jUnit: {
                        report: true,
                        savePath : './test-results/',
                        useDotNotation: true,
                        consolidate: true
                    }
                },
                all: ['lib/']
            },
            develop: {
                server: {
                    file: 'app.js'
                }
            },
            watch: {
                options: {
                    nospawn: true,
                    livereload: reloadPort
                },
                server: {
                    files: [
                        'app.js',
                        'routes/*.js',
                        'lib/*.js'
                    ],
                    tasks: ['develop', 'delayed-livereload']
                }
            },
            jshint: {
                options: {
                    jshintrc: '.jshintrc',
                    reporter: require('jshint-stylish')
                },
                gruntfile: {
                    src: 'Gruntfile.js'
                },
                lib: {
                    src: ['lib/**/*.js']
                },
                test: {
                    src: ['lib/**/*.spec.js']
                }
            },
            compress: {
                main: {
                    options: {
                        archive: '../server.zip'
                    },
                    files: [
                        {expand: true, cwd: './', src: ['**', '!node_modules/**', '!Gruntfile.js', '!.jshintrc', '.ebextensions/**']}
                    ]
                }
            }
        }
    )
    ;

    grunt.config.requires('watch.server.files');
    files = grunt.config('watch.server.files');
    files = grunt.file.expand(files);

    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-jasmine-node-coverage');



    grunt.registerTask('default', ['jshint', 'develop', 'watch']);
    grunt.registerTask('test', ['clean:test', 'jshint', 'jasmine_node']);
    grunt.registerTask('dist', ['jshint', 'compress']);
};
