/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports = {

    isBlank: function (value) {
        return !value || !Object.keys(value).length;
    },

    sortModules: function (rawData) {
        indexedData = rawData.map(a => a.split('.').map(n => +n + 100000).join('.')).sort()
            .map(a => a.split('.').map(n => +n - 100000).join('.'));
        return indexedData;
    },

    sortObject: function (moduleIndex, property) {
        moduleIndex = _.groupBy(moduleIndex, function (element) {
            return parseInt(element[property]);
        });
        return moduleIndex;
    },

    subFolders: function (folder) {
        return fs.readdirSync(folder)
            .filter(subFolder => fs.statSync(path.join(folder, subFolder)).isDirectory())
            .filter(subFolder => subFolder !== 'node_modules' && subFolder !== 'templates' && subFolder[0] !== '.')
            .map(subFolder => path.join(folder, subFolder));
    },

    collectModulesList: function (folder, parent) {
        let metaDataPath = path.join(folder, 'package.json');
        if (fs.existsSync(metaDataPath)) {
            let metaData = require(metaDataPath);
            NODICS.addRawModule(metaData, folder, parent);
            parent = metaData.name;
        }
        for (let subFolder of this.subFolders(folder)) {
            this.collectModulesList(subFolder, parent);
        }
    },

    getAllMethods: function (envScripts) {
        return Object.getOwnPropertyNames(envScripts).filter(function (prop) {
            return typeof envScripts[prop] == 'function';
        });
    },

    getFileNameWithoutExtension: function (filePath) {
        let fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.lastIndexOf("."));
        return fileName.toUpperCaseFirstChar();
    },

    removeDir: function (path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    UTILS.removeDir(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },

    schemaWalkThrough: function (options) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(options.currentDir)) {
                fs.mkdirSync(options.currentDir);
            }
            let allPromise = [];
            _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                if (moduleObject.rawSchema) {
                    _.each(moduleObject.rawSchema, (schemaObject, schemaName) => {
                        if (schemaObject.model) {
                            options.moduleName = moduleName;
                            options.moduleObject = moduleObject;
                            options.schemaName = schemaName;
                            options.schemaObject = schemaObject;
                            allPromise.push(UTILS.createObject(options));
                        }
                    });
                }
            });
            if (allPromise.length > 0) {
                Promise.all(allPromise).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    createObject: function (options) {
        return new Promise((resolve, reject) => {
            options.modelName = options.schemaName.toUpperCaseEachWord();
            if (options.schemaObject.model) {
                let entityName = options.modelName + options.postFix;
                let fileName = options.currentDir + '/Default' + entityName + '.js';
                let data = '/*\n' +
                    '\tNodics - Enterprice Micro-Services Management Framework\n\n' +

                    '\tCopyright (c) 2017 Nodics All rights reserved.\n\n' +

                    '\tThis software is the confidential and proprietary information of Nodics ("Confidential Information")\n' +
                    '\tYou shall not disclose such Confidential Information and shall use it only in accordance with the\n' +
                    '\tterms of the license agreement you entered into with Nodics\n' +

                    '*/\n\n';
                if (!UTILS.isBlank(options.gVar)) {
                    _.each(options.gVar, (value, key) => {
                        data = data + value.value + '\n';
                    });
                    data = data + '\n';
                }
                data = data + 'module.exports = ' + UTILS.replacePlaceholders(options).replace(/\\n/gm, '\n').replaceAll("\"", "") + ';';
                data = data.replaceAll('= {', '= { \n\t').replaceAll('\',', '\',\n\t').replaceAll('},', '},\n\t').replaceAll('}}', '}\n}');
                fs.writeFile(fileName,
                    data,
                    'utf-8',
                    function (error, success) {
                        if (error) {
                            UTILS.LOG.error('While creating object for file : ', fileName.replace(NODICS.getNodicsHome(), '.'), ' : ', error);
                            reject(error);
                        } else {
                            UTILS.LOG.debug('Creating class object for : ', fileName.replace(NODICS.getNodicsHome(), '.'));
                            resolve(true);
                        }
                    });
            } else {
                resolve(true);
            }
        });
    },

    replacePlaceholders: function (options) {
        var commonDefinitionString = JSON.stringify(options.commonDefinition, function (key, value) {
            if (typeof value === 'function') {
                return value.toString();
            } else if (typeof value === 'string') {
                return '\'' + value + '\'';
            } else {
                return value;
            }
        });
        let contextRoot = CONFIG.get('server').options.contextRoot;
        commonDefinitionString = commonDefinitionString.replaceAll('mdulnm', options.moduleName)
            .replaceAll('mdlnm', options.modelName + 'Model')
            .replaceAll('schmanm', options.schemaName)
            .replaceAll('mdlVar', options.modelName)
            .replaceAll('DaoName', 'Default' + options.modelName + 'Dao')
            .replaceAll('srvcName', 'Default' + options.modelName + 'Service')
            .replaceAll('dsdName', 'Default' + options.modelName + 'Facade')
            .replaceAll("ctxRoot", contextRoot)
            .replaceAll("ctrlName", 'Default' + options.modelName + 'Controller');
        return commonDefinitionString;
    },
};