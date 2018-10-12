/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    eventSplitPreSave: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let model = options.model;
                if (!UTILS.isBlank(model) && !model.targets) {
                    if (model.type == ENUMS.EventType.SYNC.key) {
                        model.state = ENUMS.EventState.PROCESSING.key;
                    }
                    model.targets = [];
                    if (!model.targetType || model.targetType === ENUMS.TargetType.MODULE.key) {
                        model.targets.push({
                            targetNodeId: model.targetNodeId,
                            target: model.target
                        });
                    } else if (model.targetType === ENUMS.TargetType.EACH_MODULE.key) {
                        model.targetType = ENUMS.TargetType.MODULE.key;
                        _.each(SYSTEM.getModulesPool().getModules(), (moduleObj, moduleName) => {
                            if (moduleName !== 'default') {
                                model.targets.push({
                                    targetNodeId: model.targetNodeId,
                                    target: moduleName
                                });
                            }
                        });
                    } else if (model.targetType === ENUMS.TargetType.EACH_NODE.key) {
                        model.targetType = ENUMS.TargetType.MODULE.key;
                        _.each(SYSTEM.getModulesPool().getModules(), (moduleObj, moduleName) => {
                            if (moduleName !== 'default') {
                                let nodes = SYSTEM.getModulesPool().getModule(moduleName).getNodes();
                                _.each(nodes, (node, nodeId) => {
                                    model.targets.push({
                                        targetNodeId: nodeId,
                                        target: moduleName
                                    });
                                });
                            }
                        });
                    } else {
                        reject('Please validate target type in event definition');
                    }
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    eventSplitPostSave: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    processSyncEvents: function (options) {
        return new Promise((resolve, reject) => {
            let events = options.response.success;
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