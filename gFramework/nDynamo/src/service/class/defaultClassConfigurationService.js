/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');


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

    addClass: function (request) {
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

    updateClass: function (request) {
        return new Promise((resolve, reject) => {
            if (!request.body.className) {
                reject('ClassName can not be null or empty');
            } else if (!request.body.type || !GLOBAL[request.body.type]) {
                reject('Invalid type: ' + request.body.type);
            } else if (!GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()]) {
                reject('Class: ' + request.body.className + ' not exist, please validate your request');
            } else {
                GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()] = _.merge(
                    GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()],
                    request.body.body);
                resolve('Successfully updated class: ' + request.body.className);
            }
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
                let entity = GLOBAL[request.body.type][request.body.className.toUpperCaseFirstChar()];
                if (request.body.isReturnPromise) {
                    entity[request.body.operationName]().then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    try {
                        let response = entity[request.body.operationName]();
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