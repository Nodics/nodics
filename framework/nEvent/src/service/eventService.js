/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    handleEvent: function(request, callback) {
        let event = request.httpRequest.body;
        if (!NODICS.getModules()[event.target].eventService.emit(event.event, event, callback)) {
            callback('There is no Listener register for this event', null);
        }
    },

    publish: function(eventDef, callback) {
        let options = {
            moduleName: 'nems',
            methodName: 'put',
            apiName: 'event/push',
            requestBody: eventDef,
            isJsonResponse: true,
            enterpriseCode: eventDef.enterpriseCode
        };

        let eventUrl = SERVICE.ModuleService.buildRequest(options);
        console.log('   INFO: Publishing event to event server');
        SERVICE.ModuleService.fetch(eventUrl, callback);
    }
};