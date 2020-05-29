/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const RequireFromString = require('require-from-string');

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

    getClass: function (request) {
        return new Promise((resolve, reject) => {
            let className = request.className;
            SERVICE.DefaultClassConfigurationService.get({
                tenant: 'default',
                query: {
                    code: className
                }
            }).then(success => {
                let classDefinition = 'No data found for class: ' + className;
                if (success.result && success.result.length > 0 && success.result[0].body) {
                    classDefinition = success.result[0].body.toString('utf8');
                    classDefinition = classDefinition.replaceAll('\n', '').replaceAll("\"", "");
                }
                resolve(classDefinition);
            }).catch(error => {
                reject(error);
            });
        });
    },

    getSnapshot: function (request) {
        return new Promise((resolve, reject) => {
            let className = request.className;
            let type = request.type;
            if (!type || !global[type]) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invlid type: ' + type));
            } else if (!className || !global[type][className.toUpperCaseFirstChar()]) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invlid className: ' + className));
            } else {
                var cache = [];
                let finalClassData = JSON.stringify(global[type][className.toUpperCaseFirstChar()], function (key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            return;
                        }
                        cache.push(value);
                    }
                    if (typeof value === 'function') {
                        return value.toString();
                    } else if (typeof value === 'string') {
                        return '\'' + value + '\'';
                    } else {
                        return value;
                    }
                }, 4);
                resolve('module.exports = ' + finalClassData.replace(/\\n/gm, '\n').replace(/\\t/gm, '').replaceAll("\"", "") + ';');
            }
        });
    },


    updateClass: function (request) {
        return new Promise((resolve, reject) => {
            let className = request.className;
            let type = request.type;
            this.finalizeClass(className, request.body).then(success => {
                this.save({
                    tenant: 'default',
                    model: {
                        code: className,
                        type: type,
                        active: true,
                        body: success
                    }
                }).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    finalizeClass: function (className, body) {
        let byteBody = null;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultClassConfigurationService.get({
                tenant: 'default',
                query: {
                    code: className
                }
            }).then(success => {
                if (success.result && success.result.length > 0 && success.result[0].body) {
                    let currentClassBody = RequireFromString('module.exports = ' +
                        body.replace(/\\n/gm, '\n').replaceAll("\"", "") + ';');
                    let mergedClass = _.merge(RequireFromString(success.result[0].body.toString('utf8')), currentClassBody);
                    let finalClassData = JSON.stringify(mergedClass, function (key, value) {
                        if (typeof value === 'function') {
                            return value.toString();
                        } else if (typeof value === 'string') {
                            return '\'' + value + '\'';
                        } else {
                            return value;
                        }
                    }, 4);
                    finalClassData = 'module.exports = ' + finalClassData.replace(/\\n/gm, '\n').replace(/\\t/gm, '').replaceAll("\"", "") + ';';
                    byteBody = Buffer.from(finalClassData, 'utf8');
                } else {
                    byteBody = Buffer.from('module.exports = ' + body + ';', 'utf8');
                }
                resolve(byteBody);
            }).catch(error => {
                reject(error);
            });
        });
    },

    classUpdateEventHandler: function (request) {
        return new Promise((resolve, reject) => {
            if (!request.event.data.models || request.event.data.models.length <= 0) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'ClassName can not be null or empty'));
            }
            this.get({
                tenant: 'default',
                query: {
                    code: {
                        $in: request.event.data.models
                    }
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    success.result.forEach(classData => {
                        let classObject = RequireFromString(classData.body.toString('utf8'));
                        if (global[classData.type]) {
                            if (global[classData.type][classData.code.toUpperCaseFirstChar()]) {
                                global[classData.type][classData.code.toUpperCaseFirstChar()] = _.merge(
                                    GLOBAL[classData.type][classData.code.toUpperCaseFirstChar()],
                                    classObject);
                            } else {
                                global[classData.type][classData.code.toUpperCaseFirstChar()] = classObject;
                            }
                            this.LOG.debug('Successfully updated class: ' + classData.code);
                            resolve('Successfully updated class: ' + classData.code);
                        } else {
                            this.LOG.error('Invalid type: ' + classData.code);
                            reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invalid type: ' + classData.type));
                        }
                    });
                } else {
                    this.LOG.error('Could not found any data for class name ' + request.event.data.models);
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Could not found any data for class name ' + request.event.data.models));
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    loadPersistedClasses: function () {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: 'default'
            }).then(success => {
                try {
                    if (success.result && success.result.length > 0) {
                        success.result.forEach(classModel => {
                            let classBody = RequireFromString(classModel.body.toString('utf8'));
                            if (global[classModel.type][classModel.code.toUpperCaseFirstChar()]) {
                                global[classModel.type][classModel.code.toUpperCaseFirstChar()] = _.merge(
                                    global[classModel.type][classModel.code.toUpperCaseFirstChar()], classBody
                                );
                            } else {
                                global[classModel.type][classModel.code.toUpperCaseFirstChar()] = classBody;
                            }
                        });
                    }
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    executeClass: function (request) {
        return new Promise((resolve, reject) => {
            if (!request.body.className) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'ClassName can not be null or empty'));
            } else if (!request.body.type || !GLOBAL[request.body.type]) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invalid type: ' + request.body.type + ' it should not be null, empty or wrong value'));
            } else if (!GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()]) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Class: ' + request.body.className + ' not exist, please validate your request'));
            } else if (!request.body.operationName || !GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()][request.body.operationName]) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Operation name: ' + request.body.operationName + ' can not be null or empty'));
            } else {
                let entityString = request.body.type + '.' + request.body.className.toUpperCaseFirstChar() + '.' + request.body.operationName;
                entityString = entityString + '(';
                if (request.body.params && request.body.params.length > 0) {
                    for (let counter = 0; counter < request.body.params.length; counter++) {
                        entityString = entityString + 'request.body.params[' + counter + ']';
                        if (counter <= request.body.params.length - 1) {
                            entityString = entityString + ',';
                        }
                    }
                }
                entityString = entityString + ')';
                if (request.body.isReturnPromise) {
                    eval(entityString).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    try {
                        let response = eval(entityString);
                        if (!response) response = 'void';
                        resolve({
                            message: 'Successfully executed operation: ' + request.body.operationName + ' from class: ' + request.body.className,
                            response: response
                        });
                    } catch (error) {
                        reject(new CLASSES.NodicsError(error, null, 'ERR_SYS_00000'));
                    }
                }
            }
        });
    }
};