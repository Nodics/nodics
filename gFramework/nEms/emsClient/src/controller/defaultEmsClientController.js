/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nEms/emsClient/src/controller/defaultEmsClientController
 * @description Exposes request handlers for nEms default ems client controller operations.
 * @layer controller
 * @owner nEms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Processes  behavior.
     *
     * @param {*} request Method input.
     * @param {*} callback Method input.
     * @returns {*} Method result.
     */
    publish: function (request, callback) {
        request.payloads = request.httpRequest.body || {};
        if (callback) {
            return FACADE.DefaultEmsClientFacade.publish(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultEmsClientFacade.publish(request);
        }
    },

    /**

     * Updates consumers information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    registerConsumers: function (request, callback) {
        if (request.httpRequest.params.consumer) {
            request.consumers = [request.httpRequest.params.consumer];
        } else {
            request.consumers = request.httpRequest.body || {};
        }
        if (callback) {
            return FACADE.DefaultEmsClientFacade.registerConsumers(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultEmsClientFacade.registerConsumers(request);
        }
    },

    /**

     * Updates publishers information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    registerPublishers: function (request, callback) {
        if (request.httpRequest.params.publisher) {
            request.publishers = [request.httpRequest.params.publisher];
        } else {
            request.publishers = request.httpRequest.body || {};
        }
        if (callback) {
            return FACADE.DefaultEmsClientFacade.registerPublishers(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultEmsClientFacade.registerPublishers(request);
        }
    },

    /**

     * Executes close consumers behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    closeConsumers: function (request, callback) {
        if (request.httpRequest.params.consumer) {
            request.consumers = [request.httpRequest.params.consumer];
        } else {
            request.consumers = request.httpRequest.body || {};
        }
        if (callback) {
            return FACADE.DefaultEmsClientFacade.closeConsumers(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultEmsClientFacade.closeConsumers(request);
        }
    },

    /**

     * Executes close publishers behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    closePublishers: function (request, callback) {
        if (request.httpRequest.params.publisher) {
            request.publishers = [request.httpRequest.params.publisher];
        } else {
            request.publishers = request.httpRequest.body || {};
        }
        if (callback) {
            return FACADE.DefaultEmsClientFacade.closePublishers(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultEmsClientFacade.closePublishers(request);
        }
    }
};