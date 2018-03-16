/*
    Nodics - Enterprice Micro-Services Management Framework

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

    handleEvent: function(request, callback) {
        if (CONTROLLER.EventController.validateEvent(request.body)) {
            FACADE.EventFacade.handleEvent(request, callback);
        }
    },

    publish: function(request, callback) {
        if (CONTROLLER.EventController.validateEvent(request.body)) {
            FACADE.EventFacade.publish(request, callback);
        }
    }
};