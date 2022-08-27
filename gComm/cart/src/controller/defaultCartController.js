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
    loadCartByRefCode: function (request, callback) {
        request.query = {
            refCode: request.httpRequest.params.refCode,
            entCode: request.authData.entCode
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
    loadCartByCode: function (request, callback) {
        request.query = {
            code: request.httpRequest.params.code,
            entCode: request.authData.entCode
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
    loadCartByToken: function (request, callback) {
        request.query = {
            token: request.httpRequest.params.token,
            entCode: request.authData.entCode
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