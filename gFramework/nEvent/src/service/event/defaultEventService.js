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

    registerEventListeners: function () {
        this.LOG.debug('Registering events');
        return new Promise((resolve, reject) => {
            try {
                let commonListeners = this.listeners.common;
                _.each(NODICS.getModules(), (value, moduleName) => {
                    value.eventService = new CLASSES.EventService();
                    if (commonListeners) {
                        _.each(commonListeners, (listenerDefinition, listenerName) => {
                            listenerDefinition.moduleName = moduleName;
                            value.eventService.registerListener(listenerDefinition);
                        });
                    }
                    let moduleListeners = this.listeners[moduleName];
                    if (moduleListeners) {
                        _.each(moduleListeners, (listenerDefinition, listenerName) => {
                            listenerDefinition.moduleName = moduleName;
                            value.eventService.registerListener(listenerDefinition);
                        });
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    handleEvent: function (request) {
        let _self = this;
        let event = request.event;
        return new Promise((resolve, reject) => {
            if (!NODICS.getModule(event.target)) {
                reject({
                    success: false,
                    code: 'SUC_EVNT_00000',
                    msg: 'Could not find target module, whithin system: ' + event.target
                });
            } else if (!NODICS.getModule(event.target).eventService) {
                reject({
                    success: false,
                    code: 'SUC_EVNT_00000',
                    msg: 'Event service has not been initialized for module: ' + event.target
                });
            } else {
                let eventService = NODICS.getModule(event.target).eventService;
                if (eventService && eventService.eventNames() &&
                    eventService.eventNames().length > 0 &&
                    eventService.eventNames().includes(event.event)) {
                    if (CONFIG.get('event').processAsSyncHandler || (event.processSync !== undefined && event.processSync === true)) {
                        eventService.emit(event.event, event, (error, success) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(success);
                            }
                        }, request);
                    } else {
                        eventService.emit(event.event, event, (error, success) => {
                            if (error || !success.success) {
                                _self.LOG.error('Facing issue while handling event');
                                _self.LOG.error(error);
                            } else {
                                _self.LOG.debug('Event has been processed successfully');
                            }
                        }, request);
                        resolve({
                            success: true,
                            code: 'SUC_EVNT_00000'
                        });
                    }

                } else {
                    if (CONFIG.get('event').ignoreIfNoLister) {
                        resolve({
                            success: true,
                            code: 'SUC_EVNT_00000',
                            msg: 'There is no Listener register for event ' + event.event + ' in module ' + event.target
                        });
                    } else {
                        reject({
                            success: true,
                            code: 'SUC_EVNT_00000',
                            msg: 'There is no Listener register for event ' + event.event + ' in module ' + event.target
                        });
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
            isJsonResponse: true,
            header: {
                apiKey: NODICS.getAPIKey(eventDef.tenant).key
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
                            if (response.success) {
                                resolve({
                                    success: true,
                                    code: 'SUC_EVNT_00000',
                                    result: response
                                });
                            } else {
                                reject({
                                    success: false,
                                    code: 'ERR_EVNT_00000',
                                    error: response
                                });
                            }
                        }).catch(error => {
                            reject({
                                success: false,
                                code: 'ERR_EVNT_00000',
                                error: error
                            });
                        });
                    } else {
                        reject({
                            success: false,
                            code: 'ERR_EVNT_00002',
                            msg: 'Currently publishing event is not allowed, pleach check property [event.publishAllActive]'
                        });
                    }
                } else {
                    reject({
                        success: false,
                        code: 'ERR_EVNT_00002',
                        msg: 'Currently test channel is running...'
                    });
                }
            } else {
                reject({
                    success: false,
                    code: 'ERR_EVNT_00002',
                    msg: 'Nodics server has not been started yet, please wait..'
                });
            }
        });
    }
};