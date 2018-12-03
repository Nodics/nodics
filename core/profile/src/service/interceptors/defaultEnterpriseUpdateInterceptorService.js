/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    enterprisePreSave: function (options) {
        return new Promise((resolve, reject) => {
            options.options.returnModified = options.options.returnModified || true;
            options.options.recursive = options.options.recursive || true;
            resolve(true);
        });
    },
    enterprisePreUpdate: function (options) {
        return new Promise((resolve, reject) => {
            options.options.returnModified = options.options.returnModified || true;
            options.options.recursive = options.options.recursive || true;
            resolve(true);
        });
    },
    enterprisePreRemove: function (options) {
        return new Promise((resolve, reject) => {
            options.options.returnModified = options.options.returnModified || true;
            options.options.recursive = options.options.recursive || true;
            resolve(true);
        });
    },

    enterpriseSaveEvent: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            let event = {
                enterpriseCode: options.model.code,
                tenant: 'default',
                event: 'enterpriseSave',
                source: options.collection.moduleName,
                target: options.collection.moduleName,
                state: "NEW",
                type: "SYNC",
                targetType: ENUMS.TargetType.MODULE.key,
                params: [{
                    key: 'schemaName',
                    value: 'enterprise'
                }, {
                    key: 'modelName',
                    value: 'EnterpriseModel'
                }, {
                    key: 'data',
                    value: options.model
                }]
            };
            this.LOG.debug('Pushing event for enterprise updated');
            SERVICE.DefaultEventService.publish(event).then(success => {
                this.LOG.debug('Event successfully posted');
            }).catch(error => {
                this.LOG.error('While posting model change event : ', error);
            });
        });
    },
    enterpriseUpdateEvent: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            let event = {
                enterpriseCode: options.model.code,
                tenant: 'default',
                event: 'enterpriseUpdate',
                source: options.collection.moduleName,
                target: options.collection.moduleName,
                state: "NEW",
                type: "SYNC",
                targetType: ENUMS.TargetType.EACH_NODE.key,
                params: [{
                    key: 'schemaName',
                    value: 'enterprise'
                }, {
                    key: 'modelName',
                    value: 'EnterpriseModel'
                }, {
                    key: 'data',
                    value: options.model
                }]
            };
            this.LOG.debug('Pushing event for enterprise updated');
            SERVICE.DefaultEventService.publish(event).then(success => {
                this.LOG.debug('Event successfully posted');
            }).catch(error => {
                this.LOG.error('While posting model change event : ', error);
            });
        });
    },
    enterpriseRemoveEvent: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            let event = {
                enterpriseCode: options.model.code,
                tenant: 'default',
                event: 'enterpriseRemove',
                source: options.collection.moduleName,
                target: options.collection.moduleName,
                state: "NEW",
                type: "SYNC",
                targetType: ENUMS.TargetType.EACH_NODE.key,
                params: [{
                    key: 'schemaName',
                    value: 'enterprise'
                }, {
                    key: 'modelName',
                    value: 'EnterpriseModel'
                }, {
                    key: 'data',
                    value: options.model
                }]
            };
            this.LOG.debug('Pushing event for enterprise updated');
            SERVICE.DefaultEventService.publish(event).then(success => {
                this.LOG.debug('Event successfully posted');
            }).catch(error => {
                this.LOG.error('While posting model change event : ', error);
            });
        });
    }

};