/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const EventEmitter = require('events');

module.exports = class EventService extends EventEmitter {

    registerListener(listenerDefinition) {
        this.on(listenerDefinition.event, eval(listenerDefinition.listner));
    }
};