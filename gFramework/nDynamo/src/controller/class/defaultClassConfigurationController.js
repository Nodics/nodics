/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const requireFromString = require('require-from-string');

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

    addClass: function (request, callback) {
        request.models = [requireFromString('module.exports = ' + request.httpRequest.body + ';')];
        if (callback) {
            FACADE.DefaultClassConfigurationFacade.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultClassConfigurationFacade.save(request);
        }
    },

    remove: function (request, callback) {
        if (callback) {
            callback('Delete operation is not supported');
        } else {
            return Promise.reject('Delete operation is not supported');
        }
    },

    removeById: function (request, callback) {
        if (callback) {
            callback('Delete operation is not supported');
        } else {
            return Promise.reject('Delete operation is not supported');
        }
    },

    removeByCode: function (request, callback) {
        if (callback) {
            callback('Delete operation is not supported');
        } else {
            return Promise.reject('Delete operation is not supported');
        }
    },

    update: function (request, callback) {
        if (callback) {
            callback('Update operation is not supported');
        } else {
            return Promise.reject('Update operation is not supported');
        }
    },
};