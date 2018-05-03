/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    nems: {
        event: {
            handleAsyncEvents: function(schema, modelName) {
                schema.post('save', function(next) {
                    let events = [];
                    if ((this instanceof Array)) {
                        this.forEach(element => {
                            if (element.type === ENUMS.EventType.SYNC.key) {
                                events.push(element);
                            }
                        });
                    } else {
                        if (this.type === ENUMS.EventType.SYNC.key) {
                            events.push(this);
                        }
                    }
                    if (events.length > 0) {
                        let input = {
                            tenant: 'default',
                            response: {
                                success: [],
                                failed: []
                            }
                        };
                        SERVICE.EventHandlerService.processSyncEvents(input, events, (error, response) => {
                            if (next && typeof next === "function") {
                                next();
                            }
                        });
                    } else {
                        if (next && typeof next === "function") {
                            next();
                        }
                    }
                });
            }
        }
    }
};