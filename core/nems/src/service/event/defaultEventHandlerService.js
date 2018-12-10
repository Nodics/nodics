/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    resetEvents: function (input) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date();
            currentDate.setTime(currentDate.getTime() - parseInt(CONFIG.get('eventResetTimeInMinutes'), 10) * 60000);
            if (!input.query) {
                input.query = {
                    $and: [{
                        "state": "PROCESSING",
                    }, {
                        "updated": {
                            "$lt": currentDate
                        }
                    }]
                };
            }
            input.body.model = {
                state: ENUMS.EventState.NEW.key
            };
            SERVICE.DefaultEventService.update(input).then(response => {
                resolve(response);
            }).catch(error => {
                reject(error);
            });
        });
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
    },

    fetchEvents: function (input) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Retrieving events to broadcast');
            input = _.merge(input, this.buildQuery());
            SERVICE.DefaultEventService.update(input).then(response => {
                if (response.success && response.result && response.result.models) {
                    resolve(response.result.models);
                } else {
                    resolve([]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    processEvents: function (request) {
        let _self = this;
        this.LOG.debug('Broadcasting async events');
        return new Promise((resolve, reject) => {
            this.fetchEvents(request).then(events => {
                if (!events || events.length <= 0) {
                    resolve({
                        success: true,
                        code: 'SUC_EVNT_00001'
                    });
                } else {
                    _self.LOG.debug('Total events to be processed : ', events.length);
                    _self.broadcastEvents(events).then(success => {
                        resolve(events);
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
                SERVICE.DefaultEventService.removeById([event._id], event.tenant).then(success => {
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
                SERVICE.DefaultEventService.update({
                    tenant: event.tenant,
                    query: {
                        '_id': event._id
                    },
                    model: event
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
                    if (!target.state || target.state === ENUMS.EventState.ERROR.key) {
                        SERVICE.DefaultModuleService.fetch(_self.prepareURL({
                            enterpriseCode: event.enterpriseCode,
                            tenant: event.tenant,
                            event: event.event,
                            source: event.source,
                            target: target.target,
                            type: event.type,
                            params: event.params
                        }, target)).then(success => {
                            if (success.success) {
                                target.state = ENUMS.EventState.FINISHED.key;
                                target.logs.push(success.msg);
                            } else {
                                event.state = ENUMS.EventState.ERROR.key;
                                target.state = ENUMS.EventState.ERROR.key;
                                target.logs.push(success.msg);
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
                apiKey: NODICS.getAPIKey(event.tenant).key
            }
        });
    }
};