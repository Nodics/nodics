/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module nems/service/interceptors/DefaultEventSplitInterceptorService
 * @description Expands saved NEMS events into concrete targets and dispatches synchronous events immediately after persistence.
 * @layer service
 * @owner nems
 * @override Project modules may override this interceptor to customize event target expansion or synchronous dispatch behavior.
 */
module.exports = {

    /**
     * Expands an event model into concrete target entries before save.
     *
     * @param {Object} request Save request containing the event model.
     * @param {Object} response Pipeline response context.
     * @returns {Promise<boolean>} Resolves when target expansion completes.
     */
    eventSplitPreSave: function (request, response) {
        return new Promise((resolve, reject) => {
            try {
                let model = request.model;
                model.excludeModules = model.excludeModules || [];
                if (!UTILS.isBlank(model) && !model.targets) {
                    if (model.type == ENUMS.EventType.SYNC.key) {
                        model.state = ENUMS.EventState.PROCESSING.key;
                    }
                    model.targets = [];
                    if (model.targetType === ENUMS.TargetType.EXTERNAL.key) {
                        let tmpTarget = {
                            target: _.merge({}, model.target)
                        };
                        if (model.targetNodeId !== undefined) {
                            tmpTarget.targetNodeId = model.targetNodeId;
                        }
                        model.targets.push(tmpTarget);
                    } else if (model.targetType === ENUMS.TargetType.MODULE_NODES.key) {
                        let modules = SERVICE.DefaultRouterService.getModulesPool().getModules();
                        let targetModule = modules[model.target] || modules.default;
                        _.each(targetModule.getNodes(), (node, nodeId) => {
                            if (!(model.skipSource && (model.sourceName === model.target && model.sourceId === nodeId))) {
                                let tmpTarget = {
                                    target: model.target
                                };
                                if (nodeId !== undefined) {
                                    tmpTarget.targetNodeId = nodeId;
                                }
                                model.targets.push(tmpTarget);
                            }
                        });
                    } else if (model.targetType === ENUMS.TargetType.EACH_MODULE.key) {
                        _.each(SERVICE.DefaultRouterService.getModulesPool().getModules(), (moduleObj, moduleName) => {
                            if (!model.excludeModules.includes(moduleName)) {
                                let targetName = model.target;
                                if (moduleName !== 'default') {
                                    targetName = moduleName;
                                }
                                let tmpTarget = {
                                    target: targetName
                                };
                                if (model.targetNodeId !== undefined) {
                                    tmpTarget.targetNodeId = model.targetNodeId;
                                }
                                model.targets.push(tmpTarget);
                            }
                        });
                    } else if (model.targetType === ENUMS.TargetType.EACH_MODULE_NODES.key) {
                        _.each(SERVICE.DefaultRouterService.getModulesPool().getModules(), (moduleObj, moduleName) => {
                            if (!model.excludeModules.includes(moduleName)) {
                                let targetName = model.target;
                                if (moduleName !== 'default') {
                                    targetName = moduleName;
                                }
                                _.each(moduleObj.getNodes(), (node, nodeId) => {
                                    if (!(model.skipSource && (model.sourceName === model.target && model.sourceId === nodeId))) {
                                        let tmpTarget = {
                                            target: targetName
                                        };
                                        if (nodeId !== undefined) {
                                            tmpTarget.targetNodeId = nodeId;
                                        }
                                        model.targets.push(tmpTarget);
                                    }
                                });
                            }
                        });
                    } else {
                        let tmpTarget = {
                            target: model.target
                        };
                        if (model.targetNodeId !== undefined) {
                            tmpTarget.targetNodeId = model.targetNodeId;
                        }
                        model.targets.push(tmpTarget);
                    }
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Reserved post-save hook for event split processing.
     *
     * @param {Object} request Save request context.
     * @param {Object} response Save response context.
     * @returns {Promise<boolean>} Resolves without changing the response.
     */
    eventSplitPostSave: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Processes a single saved synchronous event immediately.
     *
     * @param {Object} request Save request context.
     * @param {Object} response Save response containing the saved event.
     * @returns {Promise<boolean>} Resolves after synchronous dispatch, or immediately for non-sync events.
     */
    handleSyncEvent: function (request, response) {
        return new Promise((resolve, reject) => {
            if (response.success && response.success.result && response.success.result.type === ENUMS.EventType.SYNC.key) {
                SERVICE.DefaultEventHandlerService.processSyncEvents([response.success.result]).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Filters a saved event list for synchronous events and processes them immediately.
     *
     * @param {Object} request Save request context.
     * @param {Object} response Save response containing saved events.
     * @returns {Promise<boolean>} Resolves after synchronous dispatch, or immediately when no sync events exist.
     */
    handleSyncEvents: function (request, response) {
        return new Promise((resolve, reject) => {
            let events = response.success;
            let syncEvents = [];
            events.forEach(element => {
                if (element.type === ENUMS.EventType.SYNC.key) {
                    syncEvents.push(element);
                }
            });
            if (syncEvents.length > 0) {
                SERVICE.DefaultEventHandlerService.processSyncEvents(syncEvents).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};
