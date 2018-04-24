/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');

module.exports = {

    buildQuery: function() {
        return {
            recursive: false,
            pageSize: CONFIG.get('eventFetchSize'),
            pageNumber: 0,
            query: {
                $and: [{
                    $or: [{
                        state: ENUMS.EventState.NEW
                    }, {
                        state: ENUMS.EventState.ERROR
                    }]
                }, {
                    hits: { $lt: 5 }
                }]
            }
        };
    },

    processEvents: function(request, callback) {
        let _self = this;
        let input = request.local || request;
        input.response = {
            success: [],
            failed: []
        };
        _self.LOG.debug('Starting process to handle events : ');
        input = _.merge(input, this.buildQuery());
        DAO.EventDao.get(input).then(events => {
            _self.LOG.debug('Total events to be processed : ', (events instanceof Array) ? events.length : 1);
            if (events instanceof Array && events.length <= 0) {
                callback('None of the events available');
            } else if (UTILS.isBlank(events)) {
                callback('None of the events available');
            } else {
                _self.broadcastEvents(events, (error, processedEvents) => {
                    _self.handleProcessedEvents(input, processedEvents, (message) => {
                        callback(null, message);
                    });
                });
            }
        }).catch(error => {
            callback(error);
        });
    },

    handleProcessedEvents: function(request, processedEvents, callback) {
        let _self = this;
        let success = [];
        let successIds = [];
        let failed = [];
        let promisses = [];
        processedEvents.forEach(processedEvent => {
            let event = JSON.parse(JSON.stringify(processedEvent));
            if (event.state === ENUMS.EventState.FINISHED.key) {
                successIds.push(event._id);
                request.response.success.push(event._id);
                delete event._id;
                delete event.__v;
                delete event.__t;
                success.push(event);
            } else {
                failed.push(event);
                request.response.failed.push(event._id);
            }
        });
        if (success.length > 0) {
            let input = {
                tenant: request.tenant,
                models: success
            };
            promisses.push(DAO.EventLogDao.save(input));
        }
        if (success.length > 0) {
            let input = {
                tenant: request.tenant,
                ids: successIds
            };
            promisses.push(DAO.EventDao.removeById(input));
        }
        if (failed.length > 0) {
            let input = {
                tenant: request.tenant,
                models: failed
            };
            promisses.push(DAO.EventDao.update(input));
        }
        Promise.all(promisses).then(result => {
            callback(request.response);
        }).catch(error => {
            _self.LOG.error('Failed while saving success events into eventLog : ', error);
            callback(request.response);
        });
    },

    broadcastEvents: function(events, callback) {
        let _self = this;
        let processed = [];
        events.forEach(event => {
            processed.push(
                new Promise((resolve, reject) => {
                    _self.broadcastEvent(event, (err, response) => {
                        try {
                            if (err) {
                                event.state = ENUMS.EventState.ERROR;
                                event.log.push(err.toString());
                            } else {
                                event.state = ENUMS.EventState.FINISHED;
                                event.log.push('Published Successfully');
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

    broadcastEvent: function(event, callback) {
        let _self = this;
        if (!event.targetType || event.targetType === ENUMS.TargetType.MODULE.key) {
            _self.broadcastModuleEvent(event, callback);
        } else if (event.targetType === ENUMS.TargetType.EACH_MODULE.key) {

        } else if (event.targetType === ENUMS.TargetType.EACH_NODE.key) {

        }
    },

    prepareURL: function(event) {
        return SERVICE.ModuleService.buildRequest({
            connectionType: 'node',
            nodeId: event.nodeId || CONFIG.get('publishEventOnNode') || '0',
            moduleName: event.target,
            methodName: 'POST',
            apiName: 'event/handle',
            requestBody: event,
            isJsonResponse: true,
            header: {
                authToken: NODICS.getModule('nems').metaData.authToken
            }
        });
    },

    broadcastModuleEvent: function(event, callback) {
        let _self = this;
        try {
            SERVICE.ModuleService.fetch(_self.prepareURL(event)).then(response => {
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

    broadcastEachModuleEvent: function(event, callback) {
        let _self = this;
        try {
            let allModule = [];
            _.each(NODICS.getModules(), (moduleObj, moduleName) => {
                console.log(moduleName);
            });
        } catch (error) {
            _self.LOG.error('While broadcasting events : ', error);
            callback(error);
        }
    },
};