/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    init: function() {
        SYSTEM.LOG.info('Registering events');
        let listeners = SYSTEM.loadFiles('/src/event/listeners.js');
        let commonListeners = listeners.common;
        _.each(NODICS.getModules(), (value, moduleName) => {
            value.eventService = new CLASSES.EventService();
            if (commonListeners) {
                _.each(commonListeners, (listenerDefinition, listenerName) => {
                    listenerDefinition.moduleName = moduleName;
                    value.eventService.registerListener(listenerDefinition);
                });
            }
            let moduleListeners = listeners[moduleName];
            if (moduleListeners) {
                _.each(moduleListeners, (listenerDefinition, listenerName) => {
                    listenerDefinition.moduleName = moduleName;
                    value.eventService.registerListener(listenerDefinition);
                });
            }
        });
    }
};