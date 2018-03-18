/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        preFindInterceptor: function(schema, modelName) {
            schema.pre('find', function(next) {
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        postFindInterceptor: function(schema, modelName) {
            schema.post('find', function(docs, next) {
                SERVICE.VirtualPropertiesHandlerService.populateVirtualProperties(schema.rawSchema, docs);
                let moduleObject = NODICS.getModules()[schema.rawSchema.moduleName];
                SYSTEM.buildItemLevelCache(schema.rawSchema);
                if (moduleObject.itemCache && schema.rawSchema.cache && schema.rawSchema.cache.enabled) {
                    SERVICE.CacheService.putItem(schema.rawSchema, moduleObject.itemCache, this.rawQuery, docs).then(success => {
                        schema.LOG.info('Item saved in item cache');
                    }).catch(error => {
                        schema.LOG.error('While saving item in item cache : ', error);
                    });
                    if (next && typeof next === "function") {
                        next();
                    }
                } else {
                    if (next && typeof next === "function") {
                        next();
                    }
                }
            });
        },

        preSaveInterceptor: function(schema, modelName) {
            schema.pre('save', function(next) {
                if (NODICS.isNTestRunning()) {
                    next(new Error('Save operation not allowed, while running N-Test cases'));
                }
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        postSaveInterceptor: function(schema, modelName) {
            schema.post('save', function(next) {
                try {
                    let moduleObject = NODICS.getModules()[schema.rawSchema.moduleName];
                    if (moduleObject.itemCache && schema.rawSchema.cache && schema.rawSchema.cache.enabled) {
                        SERVICE.CacheService.flushItemCache({
                            moduleName: schema.rawSchema.moduleName,
                            prefix: schema.rawSchema.modelName
                        }, (error, success) => {
                            if (error) {
                                schema.LOG.error('Not able to flush item: ', schema.rawSchema.modelName, ' error : ', error);
                            } else {
                                schema.LOG.debug('Item: ', schema.rawSchema.modelName, ' flushed from cache');
                            }
                        });
                    }
                    if (NODICS.getActiveChannel() !== 'test' &&
                        NODICS.isNTestRunning() &&
                        CONFIG.get('event').publishAllActive &&
                        schema.rawSchema.event) {
                        let document = this;
                        let event = {
                            enterpriseCode: document.enterpriseCode,
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
                        schema.LOG.debug('Pushing event for item created : ', schema.rawSchema);
                        SERVICE.EventService.publish(event);
                    }
                } catch (error) {
                    schema.LOG.error('Facing issue while pushing save event : ', error);
                }
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        preUpdateInterceptor: function(schema, modelName) {
            schema.pre('update', function(next) {
                if (NODICS.isNTestRunning()) {
                    next(new Error('Save operation not allowed, while running N-Test cases'));
                }
                let model = this.getUpdate().$set;
                model.updatedDate = new Date();
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        postUpdateInterceptor: function(schema, modelName) {
            schema.post('update', function(next) {
                let moduleObject = NODICS.getModules()[schema.rawSchema.moduleName];
                if (moduleObject.itemCache && schema.rawSchema.cache && schema.rawSchema.cache.enabled) {
                    SERVICE.CacheService.flushItemCache({
                        moduleName: schema.rawSchema.moduleName,
                        prefix: schema.rawSchema.modelName
                    }, (error, success) => {
                        if (error) {
                            schema.LOG.error('Not able to flush item: ', schema.rawSchema.modelName, ' error : ', error);
                        } else {
                            schema.LOG.debug('Item: ', schema.rawSchema.modelName, ' flushed from cache');
                        }
                    });
                }
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        preSaveOrUpdateInterceptor: function(schema, modelName) {
            schema.pre('findOneAndUpdate', function(next) {
                if (NODICS.isNTestRunning()) {
                    next(new Error('Save operation not allowed, while running N-Test cases'));
                }
                let model = this.getUpdate().$set;
                model.updatedDate = new Date();
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        postSaveOrUpdateInterceptor: function(schema, modelName) {
            schema.post('findOneAndUpdate', function(next) {
                try {
                    let moduleObject = NODICS.getModules()[schema.rawSchema.moduleName];
                    if (moduleObject.itemCache && schema.rawSchema.cache && schema.rawSchema.cache.enabled) {
                        SERVICE.CacheService.flushItemCache({
                            moduleName: schema.rawSchema.moduleName,
                            prefix: schema.rawSchema.modelName
                        }, (error, success) => {
                            if (error) {
                                schema.LOG.error('Not able to flush item: ', schema.rawSchema.modelName, ' error : ', error);
                            } else {
                                schema.LOG.debug('Item: ', schema.rawSchema.modelName, ' flushed from cache');
                            }
                        });
                    }
                    if (NODICS.getActiveChannel() !== 'test' &&
                        NODICS.isNTestRunning() &&
                        CONFIG.get('event').publishAllActive &&
                        schema.rawSchema.event) {
                        let document = this._update.$set;
                        let event = {
                            enterpriseCode: document.enterpriseCode,
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
                        SERVICE.EventService.publish(event);
                    }
                } catch (error) {
                    schema.LOG.error('Facing issue while pushing save event : ', error);
                }
                if (next && typeof next === "function") {
                    next();
                }
            });
        }
    }
};