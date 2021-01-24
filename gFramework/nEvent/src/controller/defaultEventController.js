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
            throw new CLASSES.EventError('ERR_EVNT_00003', 'Event definition can not be null or empty');
        }
        return true;
    },

    handleEvent: function (request, callback) {
        try {
            CONTROLLER.DefaultEventController.validateEvent(request.httpRequest.body);
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
        } catch (error) {
            let err = new CLASSES.EventError(error, null, 'ERR_EVNT_00003');
            if (callback) {
                callback(err);
            } else {
                return Promise.reject(err);
            }
        }
    }
};