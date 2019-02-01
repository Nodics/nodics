/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const copy = require('recursive-copy');

module.exports = {

    moduleGenHelp: function () {
        console.log('');
        console.log('');
        console.log('------------------------------------------------------------------------------------------');
        console.log('Folowing command can be used to generate APP, Group or module : ');
        console.log('');
        console.log('==> $ npm run commandName [N=moduleName/NAME=moduleName]');
        console.log('{');
        console.log(' - commandName: command name could be one of app, module or help');
        console.log('      [app]     - if you want to generate application for your custom application');
        console.log('      [group]   - if you want to generate group module for your custom application');
        console.log('      [module]  - if you want to generate module for your custom application');
        console.log('      [module:react]  - if you want to generate module for your custom application');
        console.log('      [module:vue]  - if you want to generate module for your custom application');
        console.log(' - N or NAME: name of the module or application, based on command provided');
        console.log(' This app, group or module will be generated under custom folder in NODICS root directory');
        console.log('}');
        console.log('------------------------------------------------------------------------------------------');
        console.log('');

    },

    parseCommand: function () {
        let name, path;
        process.argv.forEach(element => {
            if (element.startsWith('N=')) {
                name = element.replace('N=', '');
            }
            if (element.startsWith('NAME=')) {
                name = element.replace('NAME=', '');
            }
        });
        if (!name || name === '') {
            SYSTEM.LOG.error('Name can not be null or empty');
            this.moduleGenHelp();
            process.exit(1);
        }
        let moduleObject = NODICS.getIndexedModules().get(path);
        console.log(moduleObject);
        if (!moduleObject) {
            SYSTEM.LOG.warn('Could not found module by given index, So generating at root level');
            moduleObject = NODICS.getRawModule('nodics');
        }
        return {
            name: name,
            path: moduleObject.path,
            commonPath: NODICS.getRawModule('ncommon').path + '/templates'
        };
    },

    generateTarget: function (templateName) {
        let command = this.parseCommand();
        let sourcePath = command.commonPath + '/' + templateName;
        let destPath = command.path + '/' + command.name;
        let appName = command.name;
        if (fs.existsSync(destPath)) {
            SYSTEM.LOG.error('Module directory already exist');
            process.exit(0);
        }
        var options = {
            overwrite: true,
            expand: true,
            dot: true,
            junk: true,
            filter: function (file) {
                return true;
            },
            rename: function (filePath) {
                return filePath;
            },
            transform: function (src, dest, stats) { }
        };

        copy(sourcePath, destPath, options).on(copy.events.COPY_FILE_START, function (copyOperation) {
            //console.info('Copying file ' + copyOperation.src + '...');
        }).on(copy.events.COPY_FILE_COMPLETE, function (copyOperation) {
            fs.readFile(copyOperation.dest, 'utf8', (error, content) => {
                if (error) {
                    console.log('Got error in file : ', copyOperation.dest, ' --- ', error);
                    return;
                }
                content = content.replace(/customApplication/g, appName);
                fs.writeFile(copyOperation.dest,
                    content.replace('customApplication', appName),
                    'utf8',
                    function (err) {
                        if (err) return console.log(err);
                    });
            });
        }).on(copy.events.ERROR, function (error, copyOperation) {
            console.error('Unable to copy ' + copyOperation.dest);
        }).then(function (results) {
            console.log('------------------------------------------------------------------------------------');
            console.log('Module has been generated at : ', destPath, ' - ', results.length + ' file(s) copied');
            console.log("Please visit package.json file and update index value, before executing");
            console.log('------------------------------------------------------------------------------------');

        }).catch(function (error) {
            return console.error('Copy failed: ' + error);
        });
    }
};