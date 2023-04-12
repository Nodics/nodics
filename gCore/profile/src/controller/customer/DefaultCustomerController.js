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

    isCustomerExist: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultCustomerFacade.isCustomerExist(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCustomerFacade.isCustomerExist(request);
        }
    },

    signUp: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultCustomerFacade.signUp(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCustomerFacade.signUp(request);
        }
    }
};