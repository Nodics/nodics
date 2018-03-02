/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    validateEvent: function(event) {
        if (UTILS.isBlank(event)) {
            throw Error('Event can not be empty');
        }
        return true;
    },

    handleEvent: function(requestContext, callback) {
        if (CONTROLLER.EventController.validateEvent(requestContext.httpRequest.body)) {
            FACADE.EventFacade.handleEvent(requestContext, callback);
        }
    },

    publish: function(requestContext, callback) {
        if (CONTROLLER.EventController.validateEvent(requestContext.httpRequest.body)) {
            FACADE.EventFacade.publish(requestContext, callback);
        }
    }
};