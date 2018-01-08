/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        preSaveInterceptor: function(schema, modelName) {
            schema.pre('save', function(next) {
                if (NODICS.isNTestRunning()) {
                    throw new Error('Save operation not allowed, while running N-Test cases');
                }
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        postSaveInterceptor: function(schema, modelName) {
            schema.post('save', function(next) {
                if (schema.rawSchema.event) {
                    let event = {
                        event: 'save',
                        source: schema.moduleName,
                        target: schema.moduleName,
                        state: "NEW",
                        type: "ASYNC",
                        params: [{
                            key: 'modelName',
                            value: schema.modelName
                        }]
                    };
                    SERVICE.EventService.publish(event, (error, response, request) => {
                        if (error) console.log('   ERROR: facing issue while pushing saveOrUpdate event : ', error);
                        console.log('   INFO: Event saveOrUpdate published successfully ', response);
                    });
                }
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        preUpdateInterceptor: function(schema, modelName) {
            schema.pre('update', function(next) {
                if (NODICS.isNTestRunning()) {
                    throw new Error('Update operation not allowed, while running N-Test cases');
                }
                this._update.updatedDate = new Date();
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        preSaveOrUpdateInterceptor: function(schema, modelName) {
            schema.pre('findOneAndUpdate', function(next) {
                if (NODICS.isNTestRunning()) {
                    throw new Error('Update operation not allowed, while running N-Test cases');
                }
                this._update.updatedDate = new Date();
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        postSaveOrUpdateInterceptor: function(schema, modelName) {
            schema.post('findOneAndUpdate', function(next) {
                if (schema.rawSchema.event) {
                    if (!CONFIG.get('excludedEventModels').includes(schema.modelName)) {
                        let event = {
                            event: 'saveOrUpdate',
                            source: schema.moduleName,
                            target: schema.moduleName,
                            state: "NEW",
                            type: "ASYNC",
                            params: [{
                                key: 'modelName',
                                value: schema.modelName
                            }]
                        };
                        SERVICE.EventService.publish(event, (error, response, request) => {
                            if (error) console.log('   ERROR: facing issue while pushing saveOrUpdate event : ', error);
                            console.log('   INFO: Event saveOrUpdate published successfully ', response);
                        });
                    }
                }
                if (next && typeof next === "function") {
                    next();
                }
            });
        }
    }
};