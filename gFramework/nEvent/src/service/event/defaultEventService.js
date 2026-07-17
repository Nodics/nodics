/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nEvent/src/service/event/defaultEventService
 * @description Implements nEvent default event service business behavior and extension logic.
 * @layer service
 * @owner nEvent
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
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

    /**

     * Retrieves listeners information.

     *

     * @returns {*} Method result.

     */

    getListeners: function () {
        return this.listeners;
    },

    /**

     * Retrieves persisted listeners information.

     *

     * @returns {*} Method result.

     */

    loadPersistedListeners: function () {
        return new Promise((resolve, reject) => {
            let listeners = {};
            if (!this.isPersistedListenerModelAvailable()) {
                this.LOG.warn('Persisted event listener loading skipped; no event listener model service is available');
                resolve(true);
                return;
            }
            SERVICE.DefaultEventListenerService.get({
                tenant: CONFIG.get('defaultTenant') || 'default'
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

    /**

     * Validates persisted listener model available rules.

     *

     * @returns {*} Method result.

     */

    isPersistedListenerModelAvailable: function () {
        if (!SERVICE.DefaultEventListenerService || typeof SERVICE.DefaultEventListenerService.get !== 'function') {
            return false;
        }
        try {
            let models = NODICS.getModels(CONFIG.get('systemModuleName') || 'system', CONFIG.get('defaultTenant') || 'default');
            return !!(models && models.EventListenerModel);
        } catch (error) {
            return false;
        }
    },

    /**

     * Processes listener update event behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    handleListenerUpdateEvent: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let event = request.event;
                let data = event.data;
                SERVICE.DefaultEventListenerService.get({
                    tenant: CONFIG.get('defaultTenant') || 'default',
                    query: {
                        code: {
                            $in: data.models
                        }
                    }
                }).then(success => {
                    if (success.result && success.result.length > 0) {
                        let rawListener = {};
                        success.result.forEach(listener => {
                            rawListener[listener.moduleName] = {};
                            rawListener[listener.moduleName][listener.code] = listener;
                        });
                        this.registerEventListeners(rawListener).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        reject(new CLASSES.EventError('ERR_EVNT_00003', 'Invalid eventListner code or data been updated'));
                    }
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.EventError(error, null, 'ERR_EVNT_00003'));
            }
        });
    },

    /**

     * Processes listener removed event behavior.

     *

     * @param {*} listener Method input.

     * @returns {*} Method result.

     */

    handleListenerRemovedEvent: function (listener) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let messages = [];
                request.event.data.models.forEach(listener => {
                    if (listener.moduleName === 'common') {
                        _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                            if (moduleObject.eventService) {
                                moduleObject.eventService.disableListner(listener.event, (error, success) => {
                                    if (error) {
                                        _self.LOG.error('Failed removing listener : ' + listener.event);
                                        _self.LOG.error(error);
                                    } else {
                                        _self.LOG.debug('Listener has been removed : ' + listener.event);
                                    }
                                });
                            }
                        });
                        messages.push('Event listener: ' + listener.event + ' successfully removed from common modules');
                    } else {
                        let eventService = NODICS.getModule(listener.moduleName).eventService;
                        if (eventService) {
                            eventService.disableListner(listener.event, (error, success) => {
                                if (error) {
                                    _self.LOG.error('Failed removing listener : ' + listener.event);
                                    _self.LOG.error(error);
                                } else {
                                    _self.LOG.debug('Listener has been removed : ' + listener.event);
                                }
                            });
                        }
                        messages.push('Event listener: ' + listener.event + ' successfully removed from all modules');
                    }
                });
                resolve(messages);
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
            }
        });
    },

    /**

     * Updates event listeners information.

     *

     * @param {*} listeners Method input.

     * @returns {*} Method result.

     */

    registerEventListeners: function (listeners = this.getListeners()) {
        this.LOG.debug('Registering events');
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _.each(NODICS.getModules(), (value, moduleName) => {
                    _self.registerCommonEvents(moduleName, listeners.common);
                    _self.registerModuleEvents(moduleName, listeners[moduleName]);
                });
                resolve(true);
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
            }
        });
    },

    /**

     * Updates common events information.

     *

     * @param {*} moduleName Method input.

     * @param {*} commonListeners Method input.

     * @returns {*} Method result.

     */

    registerCommonEvents: function (moduleName, commonListeners) {
        let _self = this;
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject.eventService) moduleObject.eventService = new CLASSES.EventService();
        if (commonListeners) {
            _.each(commonListeners, (listenerDefinition, listenerName) => {
                if (listenerDefinition.active === undefined) listenerDefinition.active = true;
                if (listenerDefinition.nodeId === undefined || listenerDefinition.nodeId === CONFIG.get('nodeId')) {
                    listenerDefinition.moduleName = moduleName;
                    if (listenerDefinition.active && !Object.keys(moduleObject.eventService._events).includes(listenerDefinition.event)) {
                        moduleObject.eventService.registerListener(listenerDefinition);
                    } else if (!listenerDefinition.active && Object.keys(moduleObject.eventService._events).includes(listenerDefinition.event)) {
                        moduleObject.eventService.disableListner(listenerDefinition.event, (error, success) => {
                            if (error) {
                                _self.LOG.error('Failed removing listener : ' + listener.event);
                                _self.LOG.error(error);
                            } else {
                                _self.LOG.debug('Listener has been removed : ' + listener.event);
                            }
                        });
                    }
                }
            });
        }
    },

    /**

     * Updates module events information.

     *

     * @param {*} moduleName Method input.

     * @param {*} moduleListeners Method input.

     * @returns {*} Method result.

     */

    registerModuleEvents: function (moduleName, moduleListeners) {
        let _self = this;
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject.eventService) moduleObject.eventService = new CLASSES.EventService();
        if (moduleListeners) {
            _.each(moduleListeners, (listenerDefinition, listenerName) => {
                if (listenerDefinition.active === undefined) listenerDefinition.active = true;
                if (listenerDefinition.nodeId === undefined || listenerDefinition.nodeId === CONFIG.get('nodeId')) {
                    listenerDefinition.moduleName = moduleName;
                    if (listenerDefinition.active && !Object.keys(moduleObject.eventService._events).includes(listenerDefinition.event)) {
                        moduleObject.eventService.registerListener(listenerDefinition);
                    } else if (!listenerDefinition.active && Object.keys(moduleObject.eventService._events).includes(listenerDefinition.event)) {
                        moduleObject.eventService.disableListner(listenerDefinition.event, (error, success) => {
                            if (error) {
                                _self.LOG.error('Failed removing listener : ' + listener.event);
                                _self.LOG.error(error);
                            } else {
                                _self.LOG.debug('Listener has been removed : ' + listener.event);
                            }
                        });
                    }
                }
            });
        }
    },

    /**

     * Executes enrich event error behavior.

     *

     * @param {*} error Method input.

     * @param {*} event Method input.

     * @param {*} phase Method input.

     * @returns {*} Method result.

     */

    enrichEventError: function (error, event, phase) {
        return CLASSES.NodicsError.enrich(error, {
            layer: 'event',
            phase: phase,
            eventName: event && event.event,
            tenant: event && event.tenant,
            sourceName: event && event.sourceName,
            sourceId: event && event.sourceId,
            target: event && event.target,
            targetType: event && event.targetType,
            moduleName: event && event.moduleName,
            state: event && event.state,
            type: event && event.type
        }, 'ERR_EVNT_00000');
    },

    /**

     * Processes event behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    handleEvent: function (request) {
        let _self = this;
        let event = request.event;
        event.moduleName = request.moduleName || event.target;
        return new Promise((resolve, reject) => {
            if (!NODICS.getModule(event.moduleName)) {
                reject(_self.enrichEventError(new CLASSES.NodicsError('ERR_EVNT_00003', 'Could not find moduleName, whithin system: ' + event.moduleName), event, 'handle'));
            } else if (!NODICS.getModule(event.moduleName).eventService) {
                reject(_self.enrichEventError(new CLASSES.NodicsError('ERR_EVNT_00003', 'Event service has not been initialized for module: ' + event.moduleName), event, 'handle'));
            } else {
                let eventService = NODICS.getModule(event.moduleName).eventService;
                if (eventService && eventService.eventNames() &&
                    eventService.eventNames().length > 0 &&
                    eventService.eventNames().includes(event.event)) {
                    if (CONFIG.get('event').processAsSyncHandler || (event.processSync !== undefined && event.processSync === true)) {
                        try {
                            eventService.emit(event.event, request, (error, success) => {
                                if (error) {
                                    _self.LOG.error('Facing issue while handling event');
                                    _self.LOG.error(error);
                                    reject(_self.enrichEventError(error, event, 'handle'));
                                } else {
                                    _self.LOG.debug('Event has been processed successfully');
                                    resolve(success);
                                }
                            });
                        } catch (error) {
                            _self.LOG.error('Facing issue while handling event');
                            _self.LOG.error(error);
                            reject(_self.enrichEventError(error, event, 'handle'));
                        }
                    } else {
                        try {
                            eventService.emit(event.event, request, (error, success) => {
                                if (error) {
                                    _self.LOG.error('Facing issue while handling event');
                                    _self.LOG.error(error);
                                } else {
                                    _self.LOG.debug('Event has been processed successfully');
                                }
                            });
                            resolve({
                                code: 'SUC_EVNT_00000'
                            });
                        } catch (error) {
                            _self.LOG.error('Facing issue while handling event');
                            _self.LOG.error(error);
                            reject(_self.enrichEventError(error, event, 'handle'));
                        }
                    }

                } else {
                    if (CONFIG.get('event').ignoreIfNoLister) {
                        resolve({
                            code: 'SUC_EVNT_00000',
                            message: 'There is no Listener register for event ' + event.event + ' in module ' + event.target
                        });
                    } else {
                        reject(_self.enrichEventError(new CLASSES.NodicsError('ERR_EVNT_00000', 'There is no Listener register for event ' + event.event + ' in module ' + event.target), event, 'handle'));
                    }
                }
            }
        });
    },
    /**
     * Runs pre-processing logic for pare url.
     *
     * @param {*} eventDef Method input.
     * @returns {*} Method result.
     */
    prepareURL: function (eventDef) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: CONFIG.get('nemsModuleName') || 'nems',
            methodName: 'put',
            apiName: '/event',
            requestBody: eventDef,
            responseType: true,
            header: {
                Authorization: 'Bearer ' + NODICS.getInternalAuthToken(eventDef.tenant)
            }
        });
    },

    /**

     * Processes  behavior.

     *

     * @param {*} event Method input.

     * @returns {*} Method result.

     */

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
                            reject(this.enrichEventError(error, event, 'publish'));
                        });
                    } else {
                        reject(this.enrichEventError(new CLASSES.NodicsError('ERR_EVNT_00002', 'Currently publishing event is not allowed, please check property [event.publishAllActive]'), event, 'publish'));
                    }
                } else {
                    reject(this.enrichEventError(new CLASSES.NodicsError('ERR_EVNT_00002', 'Currently test channel is running...'), event, 'publish'));
                }
            } else {
                reject(this.enrichEventError(new CLASSES.NodicsError('ERR_EVNT_00002', 'Nodics server has not been started yet, please wait..'), event, 'publish'));
            }
        });
    }
};
