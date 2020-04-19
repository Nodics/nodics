/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const EventEmitter = require('events');

module.exports = class EventService extends EventEmitter {

    addListenerHandler(listenerName, handler) {
        if (!this.handlersPool) this.handlersPool = {};
        if (this.handlersPool[listenerName]) {
            throw new CLASSES.EventError('Listener: ' + listenerName + ' already exist');
        } else {
            this.handlersPool[listenerName] = handler;
        }
    }

    getListenerHandler(listenerName) {
        return this.handlersPool[listenerName];
    }

    removeListenerHandler(listenerName) {
        delete this.handlersPool[listenerName];
    }

    registerListener(listenerDefinition) {
        let method = listenerDefinition.listener;
        let serviceName = method.substring(0, method.lastIndexOf('.'));
        let operation = method.substring(method.lastIndexOf('.') + 1, method.length);
        this.addListenerHandler(listenerDefinition.event, (request, callback) => {
            try {
                SERVICE[serviceName][operation](request, callback);
            } catch (error) {
                callback(new CLASSES.EventError(error, 'Service: ' + serviceName + ' operation: ' + operation + ' not valid'));
            }
        });
        this.on(listenerDefinition.event, this.getListenerHandler(listenerDefinition.event));
    }

    disableListner(eventName, callback) {
        this.removeListener(eventName, this.getListenerHandler(eventName));
        this.removeListenerHandler(eventName);
        callback(null, 'Event listener: ' + eventName + ' successfully removed');
    }
};