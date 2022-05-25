/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information")
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics
*/

const _ = require('lodash');

module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    createCart: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultCartFacade.createCart(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCartFacade.createCart(request);
        }
    },
    loadCart: function (request, callback) {
        request.options = request.options || {};
        request.searchOptions = request.searchOptions || {};
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
            FACADE.DefaultCartFacade.loadCart(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCartFacade.loadCart(request);
        }
    },
};