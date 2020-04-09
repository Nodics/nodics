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

    get: function (request, callback) {
        request.options = request.options || {};
        if (!request.options.recursive && request.httpRequest.get('recursive') && request.httpRequest.get('recursive') === 'true') {
            request.options.recursive = true;
        } else {
            request.options.recursive = false;
        }
        if (request.httpRequest.params.id) {
            request.query = {
                _id: request.httpRequest.params.id
            };
        } else if (request.httpRequest.params.code) {
            request.query = {
                code: request.httpRequest.params.code
            };
        } else if (!UTILS.isBlank(request.httpRequest.body)) {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.dsdName.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.get(request);
        }
    },

    remove: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.remove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.remove(request);
        }
    },

    removeById: function (request, callback) {
        request.ids = [];
        if (request.httpRequest.params.id) {
            request.ids.push(request.httpRequest.params.id);
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.dsdName.removeById(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.removeById(request);
        }
    },

    removeByCode: function (request, callback) {
        request.codes = [];
        if (request.httpRequest.params.code) {
            request.codes.push(request.httpRequest.params.code);
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.dsdName.removeByCode(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.removeByCode(request);
        }
    },

    save: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.dsdName.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.save(request);
        }
    },

    saveAll: function (request, callback) {
        request.models = request.httpRequest.body;
        if (callback) {
            FACADE.dsdName.saveAll(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.saveAll(request);
        }
    },

    update: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.update(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.update(request);
        }
    }
};