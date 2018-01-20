/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    options: {
        isNew: true
    },

    handleEvent: function(event, callback) {
        SERVICE.EventService.handleEvent(event, callback);
    },

    publish: function(event, callback) {
        SERVICE.EventService.publish(event, callback);
    }
};