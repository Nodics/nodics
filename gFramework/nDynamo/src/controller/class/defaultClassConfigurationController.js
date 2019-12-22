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


    getClass: function (request, callback) {
        request.className = request.httpRequest.params.className;
        if (callback) {
            FACADE.DefaultClassConfigurationFacade.getClass(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultClassConfigurationFacade.getClass(request);
        }
    },

    getSnapshot: function (request, callback) {
        request.className = request.httpRequest.params.className;
        request.type = request.httpRequest.params.type;
        if (callback) {
            FACADE.DefaultClassConfigurationFacade.getSnapshot(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultClassConfigurationFacade.getSnapshot(request);
        }
    },

    updateClass: function (request, callback) {
        request.className = request.httpRequest.params.className;
        request.type = request.httpRequest.params.type;
        request.body = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultClassConfigurationFacade.addClass(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultClassConfigurationFacade.addClass(request);
        }
    },


    executeClass: function (request, callback) {
        if (callback) {
            FACADE.DefaultClassConfigurationFacade.executeClass(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultClassConfigurationFacade.executeClass(request);
        }
    },

};