/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const copy = require('recursive-copy');

module.exports = {

    /**
    * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
    * defined it that with Promise way
    * @param {*} options 
    */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    generateApp: function () {
        return new Promise((resolve, reject) => {
            let command = this.parseCommand();
            this.initAppGen(command).then(success => {
                resolve(success);
            }).then(error => {
                resolve(error);
            });
        });
    },

    initAppGen: function (command) {
        return new Promise((resolve, reject) => {
            let appDetail = {
                name: command.name,
                index: command.index + ".99",
                path: command.path,
                commonPath: command.commonPath
            };
            this.generateTarget(appDetail, 'group');
            let modulesDetail = {
                name: command.name + 'Modules',
                index: command.index + ".1.99",
                path: command.path + '/' + appDetail.name,
                commonPath: command.commonPath
            };
            this.generateTarget(modulesDetail, 'group');

            let modules = [{
                name: command.name + 'Core',
                index: command.index + ".1.1",
                path: modulesDetail.path + '/' + modulesDetail.name,
                commonPath: command.commonPath
            }, {
                name: command.name + 'Int',
                index: command.index + ".1.10",
                path: modulesDetail.path + '/' + modulesDetail.name,
                commonPath: command.commonPath
            }, {
                name: command.name + 'Api',
                index: command.index + ".1.15",
                path: modulesDetail.path + '/' + modulesDetail.name,
                commonPath: command.commonPath
            }];
            modules.forEach(detail => {
                this.generateTarget(detail, 'module');
            });

            let envsDetail = {
                name: command.name + 'Envs',
                index: command.index + ".10.99",
                path: command.path + '/' + appDetail.name,
                commonPath: command.commonPath
            };
            this.generateTarget(envsDetail, 'group');

            let envLocal = {
                name: command.name + 'Local',
                index: envsDetail.index + ".1",
                path: envsDetail.path + '/' + envsDetail.name,
                commonPath: command.commonPath
            };
            this.generateTarget(envLocal, 'group');

            let serverLocal = {
                name: command.name + 'LocalServer',
                index: envLocal.index + ".1",
                path: envLocal.path + '/' + envLocal.name,
                commonPath: command.commonPath
            };
            this.generateTarget(serverLocal, 'module');

            let envDev = {
                name: command.name + 'Dev',
                index: envsDetail.index + ".10",
                path: envsDetail.path + '/' + envsDetail.name,
                commonPath: command.commonPath
            };
            this.generateTarget(envDev, 'group');
            let serverDev = {
                name: command.name + 'DevServer',
                index: envDev.index + ".1",
                path: envDev.path + '/' + envDev.name,
                commonPath: command.commonPath
            };
            this.generateTarget(serverDev, 'module');

            let envQA = {
                name: command.name + 'QA',
                index: envsDetail.index + ".15",
                path: envsDetail.path + '/' + envsDetail.name,
                commonPath: command.commonPath
            };
            this.generateTarget(envQA, 'group');
            let serverQA = {
                name: command.name + 'QAServer',
                index: envQA.index + ".1",
                path: envQA.path + '/' + envQA.name,
                commonPath: command.commonPath
            };
            this.generateTarget(serverQA, 'module');

            let preProd = {
                name: command.name + 'PreProd',
                index: envsDetail.index + ".20",
                path: envsDetail.path + '/' + envsDetail.name,
                commonPath: command.commonPath
            };
            this.generateTarget(preProd, 'group');
            let serverPreProd = {
                name: command.name + 'PreProdServer',
                index: preProd.index + ".1",
                path: preProd.path + '/' + preProd.name,
                commonPath: command.commonPath
            };
            this.generateTarget(serverPreProd, 'module');

            let prod = {
                name: command.name + 'Prod',
                index: envsDetail.index + ".25",
                path: envsDetail.path + '/' + envsDetail.name,
                commonPath: command.commonPath
            };
            this.generateTarget(prod, 'group');
            let serverProd = {
                name: command.name + 'ProdServer',
                index: prod.index + ".1",
                path: prod.path + '/' + prod.name,
                commonPath: command.commonPath
            };
            this.generateTarget(serverProd, 'module');
            resolve(true);
        });
    },

    generateModuleGroup: function () {
        return new Promise((resolve, reject) => {
            let command = this.parseCommand();
            this.generateTarget(command, 'group');
            resolve(true);
        });
    },

    generateModule: function () {
        return new Promise((resolve, reject) => {
            let command = this.parseCommand();
            this.generateTarget(command, 'module');
            resolve(true);
        });
    },

    generateReactModule: function () {
        return new Promise((resolve, reject) => {
            let command = this.parseCommand();
            this.generateTarget(command, 'moduleReact');
            resolve(true);
        });
    },

    generateVueModule: function () {
        return new Promise((resolve, reject) => {
            let command = this.parseCommand();
            this.generateTarget(command, 'moduleVue');
            resolve(true);
        });
    },

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
        let name, path, index;
        process.argv.forEach(element => {
            if (element.startsWith('N=')) {
                name = element.replace('N=', '');
            }
            if (element.startsWith('NAME=')) {
                name = element.replace('NAME=', '');
            }
            if (element.startsWith('D=')) {
                path = element.replace('D=', '');
            }
            if (element.startsWith('DEST=')) {
                path = element.replace('DEST=', '');
            }
            if (element.startsWith('IDX=')) {
                index = element.replace('IDX=', '');
            }
        });
        if (!name || name === '') {
            this.LOG.error('Name can not be null or empty');
            this.moduleGenHelp();
            process.exit(1);
        }
        if (name === 'app' && !index) {
            this.LOG.error('Index can not be null or empty');
            this.moduleGenHelp();
            process.exit(1);
        }
        this.LOG.debug('Generating folder: ' + name + ', at: ' + path);
        let moduleObject = NODICS.getIndexedModules().get(path);
        if (!moduleObject) {
            this.LOG.warn('Could not found module by given index, So generating at root level');
            moduleObject = NODICS.getRawModule('nodics');
        }
        return {
            name: name,
            path: moduleObject.path,
            index: index,
            commonPath: NODICS.getRawModule('nCommon').path + '/templates'
        };
    },

    generateTarget: function (command, templateName) {
        let sourcePath = command.commonPath + '/' + templateName;
        let destPath = command.path + '/' + command.name;
        let appName = command.name;
        if (fs.existsSync(destPath)) {
            this.LOG.error('Module directory already exist');
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
        }).on(copy.events.COPY_FILE_COMPLETE, function (copyOperation) {
            fs.readFile(copyOperation.dest, 'utf8', (error, content) => {
                if (error) {
                    console.log('Got error in file : ', copyOperation.dest, ' --- ', error);
                    return;
                }
                content = content.replace(/customApplication/g, appName);
                if (command.index) {
                    content = content.replace('$index', command.index);
                }
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