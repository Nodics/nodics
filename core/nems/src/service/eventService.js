module.exports = {
    options: {
        isNew: false
    },

    cleanEvents: function(request, callback) {

    },
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

    handleEvents: function(request, callback) {
        let _self = this;
        if (!request.options || !UTILS.isBlank(request.options)) {
            request = {
                options: this.buildQuery()
            };
        }
        this.get(request, (error, events) => {
            if (error) {
                callback(error, null, request);
            } else {
                _self.broadcastEvents(events, (error, processedEvents) => {
                    if (error) {
                        processedEvents.map(processedEvent => {
                            processedEvent.state = ENUMS.EventState.ERROR;
                            processedEvent.log.push(error.toString());
                            processedEvent.hits = processedEvent.hits + 1;
                        });
                    }
                    _self.handleProcessedEvents(request, processedEvents, callback);
                });
            }
        });
    },

    handleProcessedEvents: function(request, processedEvents, callback) {
        let success = [];
        let successIds = [];
        let failed = [];
        processedEvents.array.forEach(processedEvent => {
            if (processedEvent.state === ENUMS.EventState.FINISHED) {
                successIds.push(processedEvent._id);
                delete processedEvent._id;
                success.push(processedEvent);
            } else {
                failed.push(processedEvent);
            }
        });
        let promisses = [];

        if (success.length > 0) {
            let input = {
                tenant: request.tenant,
                models: success
            };
            promisses.push(SERVICES.EventLogService.save(input));
        }
        if (success.length > 0) {
            let input = {
                tenant: request.tenant,
                ids: successIds
            };
            promisses.push(SERVICES.EventService.removeById(input));
        }
        if (failed.length > 0) {
            let input = {
                tenant: request.tenant,
                models: failed
            };
            promisses.push(SERVICES.EventLogService.update(input));
        }

        Promise.all(promisses).then(result => {
            callback(null, result, request);
        }).catch(error => {
            callback(error, null, request);
        });
    },

    broadcastEvents: function(events, callback) {
        let _self = this;
        // Event will be always an Array, even for single event as well
        Promise.all(
            events.map(event => {
                return new Promise(function(resolve, reject) {
                    _self.broadcastEvent(event, (err, processedEvent) => {
                        if (err) {
                            processedEvent.state = ENUMS.EventState.ERROR;
                            processedEvent.log.push(err.toString());
                        } else {
                            processedEvent.state = ENUMS.EventState.FINISHED;
                            processedEvent.log.push('Published Successfully');
                        }
                        processedEvent.hits = processedEvent.hits + 1;
                        resolve(processedEvent);
                    });
                });
            })
        ).then(processedEvents => {
            callback(null, processedEvents);
        }).catch(error => {
            callback(error, events);
        });
    },

    broadcastEvent: function(event, callback) {

    }
};