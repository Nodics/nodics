/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

    ** Depricated
 */

const _ = require('lodash');

module.exports = {

    // invalidateEnterpriseAuthToken: function (enterprise, isRemoved) {
    //     let _self = this;
    //     return new Promise((resolve, reject) => {
    //         _self.updateAPIKeys({
    //             isRemoved: isRemoved,
    //             isEnterprise: true,
    //             entCode: enterprise.code,
    //             tenant: enterprise.tenant.code,
    //             enterprise: enterprise
    //         }).then(success => {
    //             resolve(success);
    //         }).catch(error => {
    //             reject(error);
    //         });
    //     });
    // },

    // updateAPIKeys: function (options) {
    //     let _self = this;
    //     return new Promise((resolve, reject) => {
    //         try {
    //             let apiKeys = NODICS.getAPIKeys();
    //             if (Object.keys(apiKeys).length > 0) {
    //                 let matchKeys = [];
    //                 _.each(apiKeys, (kayObject, tenant) => {
    //                     let oldValue = _.merge({}, kayObject);
    //                     if (options.isEnterprise && kayObject.entCode === options.entCode && kayObject.tenant === options.tenant) {
    //                         if (options.isRemoved || !options.enterprise.active || !options.enterprise.tenant.active) {
    //                             oldValue.operation = 'removed';
    //                             NODICS.removeAPIKey(options.tenant);
    //                             matchKeys.push(oldValue);
    //                         }
    //                     } else if (kayObject.entCode === options.entCode &&
    //                         kayObject.tenant === options.tenant &&
    //                         kayObject.loginId === options.loginId) {
    //                         oldValue.newKey = options.apiKey;
    //                         if (options.isRemoved) {
    //                             oldValue.operation = 'removed';
    //                             NODICS.removeAPIKey(options.tenant);
    //                         } else {
    //                             oldValue.operation = 'updated';
    //                             kayObject.key = options.apiKey;
    //                             NODICS.addAPIKey(options.tenant, options.apiKey, kayObject);
    //                         }
    //                         matchKeys.push(oldValue);
    //                     }
    //                 });
    //                 if (matchKeys.length > 0) {
    //                     _self.publishAPIKeyChangeEvent(matchKeys).then(success => {
    //                         _self.LOG.debug('Successfully updated API keys to all servers');
    //                         resolve(true);
    //                     }).catch(error => {
    //                         reject(new CLASSES.NodicsError(error, 'Failed updating API keys to all servers'));
    //                     });
    //                 } else {
    //                     resolve({
    //                         code: 'SUC_SYS_00000',
    //                         message: 'None apiKeys found to update or remove'
    //                     });
    //                 }
    //             } else {
    //                 resolve({
    //                     code: 'SUC_SYS_00000',
    //                     message: 'None apiKeys found to update or remove'
    //                 });
    //             }
    //         } catch (error) {
    //             reject(new CLASSES.NodicsError(error));
    //         }
    //     });
    // },

    // publishAPIKeyChangeEvent: function (eventsData) {
    //     return new Promise((resolve, reject) => {
    //         if (eventsData && eventsData.length > 0) {
    //             let events = [];
    //             eventsData.forEach(data => {
    //                 let eventData = {
    //                     tenant: 'default',
    //                     sourceName: 'profile',
    //                     sourceId: CONFIG.get('nodeId'),
    //                     target: 'profile',
    //                     excludeModules: ['profile'],
    //                     state: "NEW",
    //                     type: "SYNC",
    //                     active: true,
    //                     targetType: ENUMS.TargetType.EACH_MODULE_NODES.key,
    //                     data: {
    //                         tenant: data.tenant,
    //                         oldKey: data.key,
    //                         apiKey: data.newKey
    //                     }
    //                 };
    //                 if (data.operation && data.operation === 'removed') {
    //                     eventData.event = 'apiKeyRemove';
    //                 } else {
    //                     eventData.event = 'apiKeyUpdate';
    //                 }
    //                 events.push(eventData);
    //             });
    //             if (events.length > 0) {
    //                 this.LOG.debug('Pushing event for enterprise updated');
    //                 SERVICE.DefaultEventService.publish(events).then(success => {
    //                     this.LOG.debug('Event successfully posted');
    //                 }).catch(error => {
    //                     this.LOG.error('While posting model change event : ', error);
    //                 });
    //             }
    //         }
    //         resolve(true);
    //     });
    // }
};