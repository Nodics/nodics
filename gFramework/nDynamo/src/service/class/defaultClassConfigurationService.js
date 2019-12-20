/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');
const fs = require('fs');

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

    classAddEventHandler: function (request) {
        return new Promise((resolve, reject) => {
            if (!request.body.className) {
                reject('ClassName can not be null or empty');
            } else if (!request.body.type || !GLOBAL[request.body.type]) {
                reject('Invalid type: ' + request.body.type);
            } else if (GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()]) {
                reject('Class: ' + request.body.className + ' already exist, Please use update API');
            } else {
                GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()] = request.body.body;
                resolve('Successfully registered class: ' + request.body.className);
            }
        });
    },

    classUpdateEventHandler: function (request) {
        let _self = this;
        let body = request.result;
        return new Promise((resolve, reject) => {
            if (!body.code) {
                reject('ClassName can not be null or empty');
            }
            this.get({
                tenant: 'default',
                query: {
                    code: body.code
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    let classData = success.result[0];
                    let classObject = RequireFromString(classData.body.toString('utf8'));
                    if (global[classData.type]) {
                        if (global[classData.type][classData.code.toUpperCaseFirstChar()]) {
                            global[classData.type][classData.code.toUpperCaseFirstChar()] = _.merge(
                                GLOBAL[classData.type][classData.code.toUpperCaseFirstChar()],
                                classObject);
                        } else {
                            global[classData.type][classData.code.toUpperCaseFirstChar()] = classObject;
                        }
                        _self.LOG.debug('Successfully updated class: ' + classData.code);
                        resolve('Successfully updated class: ' + classData.code);
                    } else {
                        _self.LOG.error('Invalid type: ' + classData.type);
                        reject('Invalid type: ' + request.body.type);
                    }
                } else {
                    _self.LOG.error('Could not found any data for class name ' + classData.code);
                    reject('Could not found any data for class name ' + classData.code);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    addClass: function (request) {
        return new Promise((resolve, reject) => {
            let className = request.className;
            let type = request.type;
            let body = request.body;
            body = Buffer.from('module.exports = ' +
                body.replace(/\\n/gm, '\n').replaceAll("\"", "") + ';');
            this.save({
                tenant: 'default',
                moduleName: request.moduleName,
                models: [{
                    code: className,
                    type: type,
                    body: body
                }]
            }).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    publishClassAddedEvent: function (request) {
        return new Promise((resolve, reject) => {
            let event = {
                tenant: 'default',
                event: 'newClassAdded',
                sourceName: request.moduleName,
                sourceId: CONFIG.get('nodeId'),
                target: request.moduleName,
                state: "NEW",
                type: "SYNC",
                targetType: ENUMS.TargetType.MODULE_NODES.key,
                active: true,
                data: request.body
            };
            this.LOG.debug('Pushing event for class updated : ' + request.body.className);
            SERVICE.DefaultEventService.publish(event).then(success => {
                this.LOG.debug('Event successfully posted');
                resolve(success);
            }).catch(error => {
                this.LOG.error('While posting model change event : ', error);
                reject(error);
            });
        });
    },

    updateClass: function (request) {
        return new Promise((resolve, reject) => {
            this.publishClassUpdateEvent({
                body: request.body,
                moduleName: request.moduleName
            }).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    publishClassUpdateEvent: function (request) {
        return new Promise((resolve, reject) => {
            let event = {
                tenant: 'default',
                event: 'newClassAdded',
                sourceName: request.moduleName,
                sourceId: CONFIG.get('nodeId'),
                target: request.moduleName,
                state: "NEW",
                type: "SYNC",
                targetType: ENUMS.TargetType.MODULE_NODES.key,
                active: true,
                data: request.body
            };
            this.LOG.debug('Pushing event for class updated : ' + request.body.className);
            SERVICE.DefaultEventService.publish(event).then(success => {
                this.LOG.debug('Event successfully posted');
                resolve(success);
            }).catch(error => {
                this.LOG.error('While posting model change event : ', error);
                reject(error);
            });
        });
    },


    executeClass: function (request) {
        return new Promise((resolve, reject) => {
            if (!request.body.className) {
                reject('ClassName can not be null or empty');
            } else if (!request.body.type || !GLOBAL[request.body.type]) {
                reject('Invalid type: ' + request.body.type + ' it should not be null, empty or wrong value');
            } else if (!GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()]) {
                reject('Class: ' + request.body.className + ' not exist, please validate your request');
            } else if (!request.body.operationName || !GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()][request.body.operationName]) {
                reject('Operation name: ' + request.body.operationName + ' can not be null or empty');
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
                console.log(entityString);
                if (request.body.isReturnPromise) {
                    eval(entityString).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    try {
                        let response = eval(entityString);
                        if (response) {
                            resolve({
                                success: true,
                                msg: 'Successfully executed operation: ' + request.body.operationName + ' from class: ' + request.body.className,
                                response: response
                            });
                        } else {
                            resolve('Successfully executed operation: ' + request.body.operationName + ' from class: ' + request.body.className);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }

            }
        });
    }
};