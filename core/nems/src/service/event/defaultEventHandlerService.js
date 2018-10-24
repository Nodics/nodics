/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    processEvents: function (request, callback) {
        let input = request.local || request;
        if (callback) {
            this.processAsyncEvents(input).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return this.processAsyncEvents(input);
        }
    },

    buildQuery: function () {
        return {
            options: {
                returnModified: true
            },
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
            },
            model: {
                state: ENUMS.EventState.PROCESSING.key
            }
        };
        /*return {
            options: {
                recursive: false,
                pageSize: CONFIG.get('eventFetchSize'),
                pageNumber: 0,
            },
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
        };*/
    },

    fetchEvents: function (input) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Retrieving events to broadcast');
            input = _.merge(input, this.buildQuery());
            SERVICE.DefaultEventService.update(input).then(events => {
                resolve(events);
            }).catch(error => {
                reject(error);
            });
        });
    },

    processAsyncEvents: function (input) {
        let _self = this;
        this.LOG.debug('Broadcasting async events');
        return new Promise((resolve, reject) => {
            this.fetchEvents(input).then(events => {
                let models = events.models;
                if (!models || models.length <= 0) {
                    resolve('None of the events available');
                } else {
                    _self.LOG.debug('Total events to be processed : ', events.models.length);
                    _self.broadcastEvents(events.models).then(success => {
                        resolve(events.models);
                    }).catch(error => {
                        reject(error);
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    processSyncEvents: function (events) {
        let _self = this;
        this.LOG.debug('Broadcasting Sync events');
        return new Promise((resolve, reject) => {
            _self.broadcastEvents(events).then(success => {
                resolve(events);
            }).catch(error => {
                reject(error);
            });
        });
    },

    broadcastEvents: function (events, counter) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                counter = counter || 0;
                if (events && events[counter]) {
                    let event = events[counter];
                    _self.broadcastEvent(event).then(success => {
                        _self.handleProcessedEvent(event);
                        _self.broadcastEvents(events, ++counter).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        _self.broadcastEvents(events, ++counter).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    handleProcessedEvent: function (event) {
        let _self = this;
        try {
            if (event.state === ENUMS.EventState.FINISHED.key) {
                SERVICE.DefaultEventService.removeById({
                    tenant: event.tenant,
                    ids: [event._id]
                }).then(success => {
                    _self.LOG.debug('Event has been processed successfully');
                }).catch(error => {
                    _self.LOG.debug('Facing issue while updating event success log');
                });

                SERVICE.DefaultEventLogService.save({
                    tenant: event.tenant,
                    models: [event]
                }).then(success => {
                    _self.LOG.debug('Event has been moved to success log');
                }).catch(error => {
                    _self.LOG.debug('Facing issue while moved to success log');
                });
            } else {
                SERVICE.DefaultEventService.save({
                    tenant: event.tenant,
                    models: [event]
                }).then(success => {
                    _self.LOG.debug('Event has been updated for error');
                }).catch(error => {
                    _self.LOG.debug('Facing issue while updating event error log');
                });
            }
        } catch (error) {
            _self.LOG.error('While updating logs for processed event: ' + event._id, error);
        }
    },
    broadcastEvent: function (event) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (event.targets && event.targets.length > 0) {
                    event.state = ENUMS.EventState.FINISHED.key;
                    _self.broadcastEventToTarget(event, event.targets).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                _self.LOG.error('While broadcasting event to module : ', error);
                reject(error);
            }
        });
    },

    broadcastEventToTarget: function (event, targets, counter) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                counter = counter || 0;
                if (targets && targets[counter]) {
                    let target = targets[counter];
                    target.logs = target.logs || [];
                    if ((event.source !== target.target) && (!target.state || target.state === ENUMS.EventState.ERROR.key)) {
                        if (event.source !== target.target) {
                            SERVICE.DefaultModuleService.fetch(_self.prepareURL({
                                enterpriseCode: event.enterpriseCode,
                                tenant: event.tenant,
                                event: event.event,
                                source: event.source,
                                target: target.target,
                                type: event.type,
                                params: event.params
                            }, target)).then(success => {
                                console.log('-------------->> ', success);
                                if (success.success) {
                                    target.state = ENUMS.EventState.FINISHED.key;
                                    target.logs.push(success.result.toString());
                                } else {
                                    event.state = ENUMS.EventState.ERROR.key;
                                    target.state = ENUMS.EventState.ERROR.key;
                                    target.logs.push(success.error.toString());
                                }
                                _self.broadcastEventToTarget(event, targets, ++counter).then(success => {
                                    resolve(success);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                target.state = ENUMS.EventState.ERROR.key;
                                target.logs.push(error.toString());
                                _self.broadcastEventToTarget(event, targets, ++counter).then(success => {
                                    resolve(success);
                                }).catch(error => {
                                    reject(error);
                                });
                            });
                        }
                    } else {
                        _self.broadcastEventToTarget(event, targets, ++counter).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    prepareURL: function (event, target) {
        let connectionType = 'abstract';
        let nodeId = 0;
        if (target.targetNodeId) {
            connectionType = 'node';
            nodeId = target.targetNodeId;
        }
        return SERVICE.DefaultModuleService.buildRequest({
            connectionType: connectionType,
            nodeId: nodeId,
            moduleName: target.target,
            methodName: 'POST',
            apiName: '/event/handle',
            requestBody: event,
            isJsonResponse: true,
            header: {
                authToken: NODICS.getModule('nems').metaData.authToken
            }
        });
    },

    /*
    
    
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
                    delete event._id;
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
                                if (!event.log) {
                                    event.log = [];
                                }
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
                callback(null, 'None of the events available');
            } else if (UTILS.isBlank(events)) {
                callback(null, 'None of the events available');
            } else {
                try {
                    events.forEach(event => {
                        _self.processEvent(event).then(success => {
                            console.log('---------------------------------------------');
                            console.log(success);
                            console.log('---------------------------------------------');
                            _self.handleProcessedEvents(request, event, success).then(success => {
                                _self.LOG.debug('Event: ' + event._id + ' has heen published successfully');
                            }).catch(error => {
                                _self.LOG.error('Event: ' + event._id + ' failed while updating its log');
                            });
                        }).catch(error => {
                            _self.LOG.error('Event: ' + event._id + ' publishing failed due to : ', error);
                            _self.handleProcessedEvents(request, event, {
                                success: false,
                                code: 'ERR001',
                                msg: 'Process failed with errors',
                                error: [error]
                            }).then(success => {
                                _self.LOG.error('Event: ' + event._id + ' error log updated successfully');
                            }).catch(error => {
                                _self.LOG.error('Event: ' + event._id + ' failed while updating its error log');
                            });
                        });
                    });
                    callback(null, 'Event broadcasting started successfully');
                } catch (error) {
                    callback(error);
                }
            }
        }).catch(error => {
            callback(error);
        });
    },

    handleProcessedEvents: function (request, event, response) {

    },

    processEvent: function (event) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!event.targetType || event.targetType === ENUMS.TargetType.MODULE.key) {
                _self.broadcastEventToModule(event).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else if (event.targetType === ENUMS.TargetType.EACH_MODULE.key) {
                _self.broadcastEventToEachModule(event).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else if (event.targetType === ENUMS.TargetType.EACH_NODE.key) {
                _self.broadcastEventToEachNode(event).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                reject('Please validate target type in event definition');
            }
        });
    },



    broadcastEventToModule: function (event) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultModuleService.fetch(_self.prepareURL(event)).then(success => {
                    resolve([success]);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                _self.LOG.error('While broadcasting event to module : ', error);
                reject(error);
            }
        });
    },

    broadcastEventToEachModule: function (event) {
        let _self = this;
        return new Promise((resolve, reject) => {
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
                        resolve(success);
                    }).catch(error => {
                        callback(error);
                    });
                }
            } catch (error) {
                _self.LOG.error('While broadcasting event to each module : ', error);
                reject(error);
            }
        });
    },

    broadcastEventToEachNode: function (event) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let allPromise = [];
                _.each(SYSTEM.getModulesPool().getModules(), (moduleObj, moduleName) => {
                    if (moduleName != 'default') {
                        event.target = moduleName;
                        let nodes = SYSTEM.getModulesPool().getModule(moduleName).getNodes();
                        _.each(nodes, (node, nodeId) => {
                            event.targetNodeId = parseInt(nodeId, 10);
                            allPromise.push(
                                SERVICE.DefaultModuleService.fetch(_self.prepareURL(event))
                            );
                        });
                    }
                });
                if (allPromise.length > 0) {
                    Promise.all(allPromise).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } catch (error) {
                _self.LOG.error('While broadcasting event to each node : ', error);
                reject(error);
            }
        });
    }
    */
    // **************************************************************************************************


};