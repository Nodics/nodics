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

    handleNodeActivated: function (request, callback) {
        if (request.httpRequest.params.nodeId) {
            request.nodeId = request.httpRequest.params.nodeId;
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.DefaultNodeManagerFacade.handleNodeActivated(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultNodeManagerFacade.handleNodeActivated(request);
        }
    },

    requestResponsibility: function (request, callback) {
        if (request.httpRequest.params.nodeId) {
            request.nodeId = request.httpRequest.params.nodeId;
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.DefaultNodeManagerFacade.requestResponsibility(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultNodeManagerFacade.requestResponsibility(request);
        }
    },

    stopHealthCheck: function (request, callback) {
        if (callback) {
            FACADE.DefaultNodeManagerFacade.stopHealthCheck(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultNodeManagerFacade.stopHealthCheck(request);
        }
    }
};