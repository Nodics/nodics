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
        this.on(listenerDefinition.event, SERVICE[serviceName][operation]);
    }
};