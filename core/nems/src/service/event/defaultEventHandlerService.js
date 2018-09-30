/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    buildQuery: function () {
        return {
            recursive: false,
            pageSize: CONFIG.get('eventFetchSize'),
            pageNumber: 0,
            query: {
                $and: [{
                    $or: [{
                        state: ENUMS.EventState.NEW.key
                    }, {
                        state: ENUMS.EventState.ERROR.key
                    }]
                }, {
                    hits: { $lt: 5 }
                }]
            }
        };
    },

    processEvents: function (request, callback) {
        let _self = this;
        let input = request.local || request;
        input.response = {
            success: [],
            failed: []
        };
        _self.LOG.debug('Starting process to handle events : ');
        input = _.merge(input, this.buildQuery());
        SERVICE.DefaultEventService.get(input).then(events => {
            _self.LOG.debug('Total events to be processed : ', (events instanceof Array) ? events.length : 1);
            if ((events instanceof Array) && (events.length <= 0)) {
                callback('None of the events available');
            } else if (UTILS.isBlank(events)) {
                callback('None of the events available');
            } else {
                _self.processSyncEvents(input, events, callback);
            }
        }).catch(error => {
            callback(error);
        });
    },

    processSyncEvents: function (input, events, callback) {
        let _self = this;
        _self.broadcastEvents(events, (error, processedEvents) => {
            _self.handleProcessedEvents(input, processedEvents, (message) => {
                callback(null, message);
            });
        });
    },

    handleProcessedEvents: function (request, processedEvents, callback) {
        let _self = this;
        let success = [];
        let failed = [];
        let promisses = [];
        processedEvents.forEach(processedEvent => {
            let event = JSON.parse(JSON.stringify(processedEvent));
            if (event.state === ENUMS.EventState.FINISHED.key) {
                request.response.success.push(event._id);
                event.type = 'ASYNC';
                success.push(event);
            } else {
                event.type = 'ASYNC';
                failed.push(event);
                request.response.failed.push(event._id);
            }
        });
        if (success.length > 0) {
            let input = {
                tenant: request.tenant,
                models: success
            };
            promisses.push(SERVICE.DefaultEventLogService.save(input));
        }
        if (success.length > 0) {
            let input = {
                tenant: request.tenant,
                ids: request.response.success
            };
            promisses.push(SERVICE.DefaultEventService.removeById(input));
        }
        if (failed.length > 0) {
            let input = {
                tenant: request.tenant,
                models: failed
            };
            promisses.push(SERVICE.DefaultEventService.update(input));
        }
        Promise.all(promisses).then(result => {
            callback(request.response);
        }).catch(error => {
            _self.LOG.error('Failed while saving success events into eventLog : ', error);
            callback(request.response);
        });
    },

    broadcastEvents: function (events, callback) {
        let _self = this;
        let processed = [];
        events.forEach(event => {
            processed.push(
                new Promise((resolve, reject) => {
                    _self.broadcastEvent(event, (err, response) => {
                        try {
                            if (err) {
                                event.state = ENUMS.EventState.ERROR.key;
                                event.log.push(err.toString());
                            } else {
                                event.state = ENUMS.EventState.FINISHED.key;
                                if (response instanceof Array) {
                                    response.forEach(element => {
                                        event.log.push(element.result);
                                    });
                                } else {
                                    event.log.push(response.result);
                                }
                            }
                            event.hits = event.hits + 1;
                            resolve(event);
                        } catch (error) {
                            _self.LOG.error('While preparing broadcasting events : ', error);
                            resolve(event);
                        }
                    });
                })
            );
        });

        Promise.all(processed).then(result => {
            callback(null, result);
        }).catch(error => {
            callback(error);
        });
    },

    broadcastEvent: function (event, callback) {
        let _self = this;
        if (!event.targetType || event.targetType === ENUMS.TargetType.MODULE.key) {
            _self.broadcastModuleEvent(event, callback);
        } else if (event.targetType === ENUMS.TargetType.EACH_MODULE.key) {
            _self.broadcastEachModuleEvent(event, callback);
        } else if (event.targetType === ENUMS.TargetType.EACH_NODE.key) {
            _self.broadcastEachNodeEvent(event, callback);
        }
    },

    prepareURL: function (event) {
        let connectionType = 'abstract';
        let nodeId = '0';
        if (event.targetNodeId) {
            connectionType = 'node';
            nodeId = definition.targetNodeId;
        }
        return SERVICE.DefaultModuleService.buildRequest({
            connectionType: connectionType,
            nodeId: nodeId,
            moduleName: event.target,
            methodName: 'POST',
            apiName: '/event/handle',
            requestBody: event,
            isJsonResponse: true,
            header: {
                authToken: NODICS.getModule('nems').metaData.authToken
            }
        });
    },

    broadcastModuleEvent: function (event, callback) {
        let _self = this;
        try {
            SERVICE.DefaultModuleService.fetch(_self.prepareURL(event)).then(response => {
                if (response.success) {
                    callback(null, response);
                } else {
                    callback(JSON.stringify(response.errors));
                }
            }).catch(error => {
                callback(error);
            });
        } catch (error) {
            _self.LOG.error('While broadcasting events : ', error);
            callback(error);
        }
    },

    broadcastEachModuleEvent: function (event, callback) {
        let _self = this;
        try {
            let allPromise = [];
            _.each(SYSTEM.getModulesPool().getModules(), (moduleObj, moduleName) => {
                if (moduleName != 'default') {
                    event.target = moduleName;
                    allPromise.push(
                        SERVICE.DefaultModuleService.fetch(_self.prepareURL(event))
                    );
                }
            });
            if (allPromise.length > 0) {
                Promise.all(allPromise).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            }
        } catch (error) {
            _self.LOG.error('While broadcasting event to each module : ', error);
            callback(error);
        }
    },

    broadcastEachNodeEvent: function (event, callback) {
        let _self = this;
        try {
            let allPromise = [];
            _.each(SYSTEM.getModulesPool().getModules(), (moduleObj, moduleName) => {
                if (moduleName != 'default') {
                    event.target = moduleName;
                    let nodes = SYSTEM.getModulesPool().getModule(moduleName).getNodes();
                    _.each(nodes, (node, nodeId) => {
                        event.targetNodeId = nodeId;
                        allPromise.push(
                            SERVICE.DefaultModuleService.fetch(_self.prepareURL(event))
                        );
                    });
                }
            });
            if (allPromise.length > 0) {
                Promise.all(allPromise).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            }
        } catch (error) {
            _self.LOG.error('While broadcasting event to each node : ', error);
            callback(error);
        }
    },
};