/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

var fs = require('fs');
var copy = require('recursive-copy');
var path = require('path');

var help = function() {
    console.log('----------------------------------');
    console.log('This process help you to generate Application or module for your application');
    console.log('');
    console.log('$ node install [commandName] [name] [appName]/[appPath]');
    console.log('');
    console.log('=> commandName: command name could be one of app, module or help');
    console.log('        app     - if you want to generate application for your custom application');
    console.log('        group   - if you want to generate group module for your custom application');
    console.log('        module  - if you want to generate module for your custom application');
    console.log('=> name: name of the module or application, based on command provided');
    console.log('=> appName: if command is module, pass application name where this module needs to be generated');
    console.log('----------------------------------');
};

var createApplication = function(appName, appPath) {
    let sourcePath = __dirname + '/framework/nCommon/templates/app';
    let destPath = __dirname + '/' + appName;
    if (appPath) {
        destPath = __dirname + appPath + '/' + appName;
    }
    if (fs.existsSync(destPath)) {
        console.log('Application directory already exist');
        process.exit(0);
    }
    copyDir(sourcePath, destPath, appName);
};

var createModule = function(moduleName, appName) {
    let sourcePath = __dirname + '/framework/nCommon/templates/module';
    let destPath = __dirname + appName;
    if (!fs.existsSync(destPath)) {
        console.log('Application has not been created yet, please create Application');
        process.exit(0);
    }
    destPath = destPath + '/' + moduleName;
    if (fs.existsSync(destPath)) {
        console.log('Module already exist');
        process.exit(0);
    }
    copyDir(sourcePath, destPath, moduleName);
};

var copyDir = function(sourcePath, destPath, appName) {
    var options = {
        overwrite: true,
        expand: true,
        dot: true,
        junk: true,
        filter: function(file) {
            return true;
        },
        rename: function(filePath) {
            return filePath;
        },
        transform: function(src, dest, stats) {}
    };

    copy(sourcePath, destPath, options)
        .on(copy.events.COPY_FILE_START, function(copyOperation) {
            //console.info('Copying file ' + copyOperation.src + '...');
        })
        .on(copy.events.COPY_FILE_COMPLETE, function(copyOperation) {
            fs.readFile(copyOperation.dest, 'utf8', (error, content) => {
                if (error) {
                    console.log('Got error in file : ', copyOperation.dest, ' --- ', error);
                    return;
                }
                content = content.replace(/customApplication/g, appName);
                fs.writeFile(copyOperation.dest,
                    content.replace('customApplication', appName),
                    'utf8',
                    function(err) {
                        if (err) return console.log(err);
                    });
            });
        })
        .on(copy.events.ERROR, function(error, copyOperation) {
            console.error('Unable to copy ' + copyOperation.dest);
        })
        .then(function(results) {
            console.log('------------------------------------------------------------------------------------');
            console.log('Module has been generated at : ', destPath, ' - ', results.length + ' file(s) copied');
            console.log("Please visit package.json file and update index value, before executing");
            console.log('------------------------------------------------------------------------------------');

        })
        .catch(function(error) {
            return console.error('Copy failed: ' + error);
        });
};

module.exports = (function() {
    if (!process.argv[2]) {
        console.log('ERROR: Please pass command to be executed');
        return help();
    }
    const command = process.argv[2];
    if (!process.argv[3] && command !== 'help') {
        console.log('ERROR: Please pass name of module or application to be created');
        return help();
    }
    const name = process.argv[3];
    let appPath = process.argv[4];
    if (command === 'help') {
        help();
    } else if (command === 'app' || command === 'application' || command === 'group') {
        createApplication(name, appPath);
    } else if (command === 'module') {
        console.log(name, ' ------ ', appPath);
        if (!appPath) {
            console.log('ERROR: Please pass Application name, where this module needs to be generated');
            return help();
        }
        createModule(name, appPath);
    } else {
        console.log('ERROR: Please pass a valid commandName to proceed');
        return help();
    }
})();