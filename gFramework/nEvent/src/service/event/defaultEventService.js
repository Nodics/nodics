/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    listeners: {},
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            this.listeners = SERVICE.DefaultFilesLoaderService.loadFiles('/src/event/listeners.js');
            resolve(true);
        });
    },

    getListeners: function () {
        return this.listeners;
    },

    loadPersistedListeners: function () {
        return new Promise((resolve, reject) => {
            let listeners = {};
            SERVICE.DefaultEventListenerService.get({
                tenant: 'default'
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    success.result.forEach(listener => {
                        if (!listeners[listener.moduleName]) listeners[listener.moduleName] = {};
                        if (listeners[listener.moduleName][listener.code]) {
                            listeners[listener.moduleName][listener.code] = _.merge(
                                listeners[listener.moduleName][listener.code], listener
                            );
                        } else {
                            listeners[listener.moduleName][listener.code] = listener;
                        }
                    });
                }
                this.listeners = _.merge(this.listeners, listeners);
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    handleListenerUpdateEvent: function (listener) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultEventListenerService.get({
                    tenant: 'default',
                    query: {
                        code: listener.code
                    }
                }).then(success => {
                    if (success.result && success.result.length > 0) {
                        let rawListener = {};
                        rawListener[success.result[0].moduleName] = {};
                        rawListener[success.result[0].moduleName][success.result[0].code] = success.result[0];
                        this.registerEventListeners(rawListener).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        reject(new CLASSES.NodicsError('ERR_EVNT_00000', 'Invalid eventListner code or data been updated'));
                    }
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
            }
        });
    },

    handleListenerRemovedEvent: function (listener) {
        return new Promise((resolve, reject) => {
            try {
                if (listener.moduleName === 'common') {
                    _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                        if (moduleObject.eventService) {
                            moduleObject.eventService.removeListener(listener.event);
                        }
                    });
                    resolve('Event listener: ' + listener.event + ' successfully removed from all modules');
                } else {
                    let eventService = NODICS.getModule(listener.moduleName).eventService;
                    if (eventService) {
                        eventService.removeListener(listener.event);
                    }
                    resolve('Event listener: ' + listener.event + ' successfully removed from module: ' + listener.moduleName);
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
            }
        });
    },

    registerEventListeners: function (listeners = this.getListeners()) {
        this.LOG.debug('Registering events');
        return new Promise((resolve, reject) => {
            try {
                let commonListeners = listeners.common;
                _.each(NODICS.getModules(), (value, moduleName) => {
                    value.eventService = new CLASSES.EventService();
                    if (commonListeners) {
                        _.each(commonListeners, (listenerDefinition, listenerName) => {
                            if (listenerDefinition.nodeId === undefined || listenerDefinition.nodeId === CONFIG.get('nodeId')) {
                                listenerDefinition.moduleName = moduleName;
                                if (listenerDefinition.active === undefined || listenerDefinition.active) {
                                    value.eventService.registerListener(listenerDefinition);
                                } else if (Object.keys(value.eventService._events).includes(listenerDefinition.event)) {
                                    value.eventService.removeListener(listenerDefinition);
                                }
                            }
                        });
                    }
                    let moduleListeners = this.listeners[moduleName];
                    if (moduleListeners) {
                        _.each(moduleListeners, (listenerDefinition, listenerName) => {
                            if (listenerDefinition.nodeId === undefined || listenerDefinition.nodeId === CONFIG.get('nodeId')) {
                                listenerDefinition.moduleName = moduleName;
                                if (listenerDefinition.active === undefined || listenerDefinition.active) {
                                    value.eventService.registerListener(listenerDefinition);
                                } else if (Object.keys(value.eventService._events).includes(listenerDefinition.event)) {
                                    value.eventService.removeListener(listenerDefinition);
                                }
                            }
                        });
                    }
                });
                resolve(true);
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
            }
        });
    },

    handleEvent: function (request) {
        let _self = this;
        let event = request.event;
        return new Promise((resolve, reject) => {
            if (!NODICS.getModule(event.target)) {
                reject(new CLASSES.NodicsError('ERR_EVNT_00000', 'Could not find target module, whithin system: ' + event.target));
            } else if (!NODICS.getModule(event.target).eventService) {
                reject(new CLASSES.NodicsError('ERR_EVNT_00000', 'Event service has not been initialized for module: ' + event.target));
            } else {
                let eventService = NODICS.getModule(event.target).eventService;
                if (eventService && eventService.eventNames() &&
                    eventService.eventNames().length > 0 &&
                    eventService.eventNames().includes(event.event)) {
                    if (CONFIG.get('event').processAsSyncHandler || (event.processSync !== undefined && event.processSync === true)) {
                        try {
                            eventService.emit(event.event, event, (error, success) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(success);
                                }
                            }, request);
                        } catch (error) {
                            reject(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
                        }
                    } else {
                        try {
                            eventService.emit(event.event, event, (error, success) => {
                                if (error || !success.success) {
                                    _self.LOG.error('Facing issue while handling event');
                                    _self.LOG.error(error);
                                } else {
                                    _self.LOG.debug('Event has been processed successfully');
                                }
                            }, request);
                            resolve({
                                code: 'SUC_EVNT_00000'
                            });
                        } catch (error) {
                            reject(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
                        }
                    }

                } else {
                    if (CONFIG.get('event').ignoreIfNoLister) {
                        resolve({
                            code: 'SUC_EVNT_00000',
                            msg: 'There is no Listener register for event ' + event.event + ' in module ' + event.target
                        });
                    } else {
                        reject(new CLASSES.NodicsError('ERR_EVNT_00000', 'There is no Listener register for event ' + event.event + ' in module ' + event.target));
                    }
                }
            }
        });
    },
    prepareURL: function (eventDef) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: 'nems',
            methodName: 'put',
            apiName: '/event',
            requestBody: eventDef,
            responseType: true,
            header: {
                authToken: NODICS.getInternalAuthToken(eventDef.tenant)
            }
        });
    },

    publish: function (event) {
        return new Promise((resolve, reject) => {
            if (NODICS.getServerState() === 'started') {
                if (NODICS.getActiveChannel() !== 'test' && !NODICS.isNTestRunning()) {
                    if (CONFIG.get('event').publishAllActive) {
                        this.LOG.debug('Publishing event to event server');
                        SERVICE.DefaultModuleService.fetch(this.prepareURL(event)).then(response => {
                            resolve({
                                code: 'SUC_EVNT_00000',
                                result: response.result
                            });
                        }).catch(error => {
                            reject(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
                        });
                    } else {
                        reject(new CLASSES.NodicsError('ERR_EVNT_00002', 'Currently publishing event is not allowed, please check property [event.publishAllActive]'));
                    }
                } else {
                    reject(new CLASSES.NodicsError('ERR_EVNT_00002', 'Currently test channel is running...'));
                }
            } else {
                reject(new CLASSES.NodicsError('ERR_EVNT_00002', 'Nodics server has not been started yet, please wait..'));
            }
        });
    }
};