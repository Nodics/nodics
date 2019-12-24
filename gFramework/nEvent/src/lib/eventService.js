/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const EventEmitter = require('events');

module.exports = class EventService extends EventEmitter {

    registerListener(listenerDefinition) {
        let method = listenerDefinition.listener;
        let serviceName = method.substring(0, method.lastIndexOf('.'));
        let operation = method.substring(method.lastIndexOf('.') + 1, method.length);
        this.on(listenerDefinition.event, (event, callback, request) => {
            try {
                SERVICE[serviceName][operation](event, callback, request);
            } catch (error) {
                callback({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    error: error
                });
            }
        });
    }

    removeListener(eventName) {
        this.removeListener(eventName, () => {
            callback({
                success: true,
                code: 'SUC_EVNT_00000',
                msg: 'Event listener: ' + eventName + ' successfully removed'
            });
        });
    }
};