/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    handleEvent: function(request, callback) {
        let event = request.body;
        if (!NODICS.getModules()[event.target].eventService.emit(event.event, event, callback)) {
            callback('There is no Listener register for this event', null);
        }
    },

    prepareURL: function(eventDef) {
        return SERVICE.ModuleService.buildRequest({
            moduleName: 'nems',
            methodName: 'put',
            apiName: 'event/push',
            requestBody: eventDef,
            isJsonResponse: true,
            header: {
                enterpriseCode: eventDef.enterpriseCode
            }
        });
    },

    publish: function(request, callback) {
        let eventDef = request.body || request;
        this.LOG.debug('Publishing event to event server');
        SERVICE.ModuleService.fetch(this.prepareURL(eventDef), callback);
    }
};