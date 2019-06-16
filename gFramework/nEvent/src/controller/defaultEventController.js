/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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

    validateEvent: function (event) {
        if (UTILS.isBlank(event)) {
            return false;
        }
        return true;
    },

    handleEvent: function (request, callback) {
        if (CONTROLLER.DefaultEventController.validateEvent(request.httpRequest.body)) {
            request.event = request.httpRequest.body;
            if (callback) {
                FACADE.DefaultEventFacade.handleEvent(request).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultEventFacade.handleEvent(request);
            }
        } else {
            if (callback) {
                callback({
                    success: false,
                    code: 'ERR_EVNT_00001'
                });
            } else {
                return Promise.reject({
                    success: false,
                    code: 'ERR_EVNT_00001'
                });
            }
        }
    },
    /*
        publish: function (request, callback) {
            if (CONTROLLER.DefaultEventController.validateEvent(request.httpRequest.body)) {
                if (callback) {
                    request.event = request.httpRequest.body;
                    FACADE.DefaultEventFacade.publish(request).then(success => {
                        callback(null, success);
                    }).catch(error => {
                        callback(error);
                    });
                } else {
                    return FACADE.DefaultEventFacade.publish(request);
                }
            } else {
                if (callback) {
                    callback({
                        success: false,
                        code: 'ERR_EVNT_00001'
                    });
                } else {
                    return Promise.reject({
                        success: false,
                        code: 'ERR_EVNT_00001'
                    });
                }
            }
        }
    */
};