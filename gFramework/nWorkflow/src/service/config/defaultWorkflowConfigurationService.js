/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    interceptors: {},
    valodators: {},

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Collecting database middlewares');
            NODICS.setRawModels(SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/model.js'));
            resolve(true);
        });
    },

    getWorkflowInterceptors: function (itemCode) {
        if (!this.interceptors[itemCode]) {
            this.interceptors[itemCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(itemCode, ENUMS.InterceptorType.workflow.key);
        }
        return this.interceptors[itemCode];
    },

    refreshWorkflowInterceptors: function () {
        if (this.interceptors && !UTILS.isBlank(this.interceptors)) {
            Object.keys(this.interceptors).forEach(itemCode => {
                this.interceptors[itemCode] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(itemCode, ENUMS.InterceptorType.workflow.key);
            });
        }
    },

    getWorkflowValidators: function (tenant, itemCode) {
        if (this.interceptors &&
            !UTILS.isBlank(this.valodators[tenant]) &&
            !UTILS.isBlank(this.valodators[tenant][itemCode])) {
            return this.valodators[tenant][itemCode];
        } else {
            return null;
        }
    },

    // prepareWorkflowInterceptors: function () {
    //     return new Promise((resolve, reject) => {
    //         let items = [];
    //         SERVICE.DefaultWorkflowHeadService.getTenantActiveWorkflowHeads(NODICS.getActiveTenants(), items).then(itemCodes => {
    //             SERVICE.DefaultWorkflowActionService.getTenantActiveWorkflowActions(NODICS.getActiveTenants(), itemCodes).then(itemCodes => {
    //                 SERVICE.DefaultWorkflowChannelService.getTenantActiveWorkflowChannels(NODICS.getActiveTenants(), itemCodes).then(itemCodes => {
    //                     Object.keys(itemCodes).forEach(tenant => {
    //                         itemCodes[tenant].forEach(itemCode => {
    //                             if (!items.includes(itemCode)) items.push(itemCode);
    //                         });
    //                     });
    //                     SERVICE.DefaultInterceptorConfigurationService.prepareInterceptors(
    //                         items,
    //                         ENUMS.InterceptorType.workflow.key
    //                     ).then(workflowInterceptors => {
    //                         this.interceptors = workflowInterceptors;
    //                         resolve(true);
    //                     }).catch(error => {
    //                         reject(error);
    //                     });
    //                 }).catch(error => {
    //                     reject(error);
    //                 });
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         }).catch(error => {
    //             reject(error);
    //         });
    //     });
    // },

    // buildWorkflowValidators: function (itemCodes, validators, tenants = NODICS.getActiveTenants()) {
    //     if (!validators) validators = {};
    //     return new Promise((resolve, reject) => {
    //         if (tenants && tenants.length > 0) {
    //             let tenant = tenants.shift();
    //             SERVICE.DefaultValidatorConfigurationService.prepareValidators(
    //                 tenant,
    //                 itemCodes[tenant],
    //                 ENUMS.ValidatorType.workflow.key
    //             ).then(workflowValidators => {
    //                 validators[tenant] = workflowValidators;
    //                 this.buildWorkflowValidators(itemCodes, validators, tenants).then(validators => {
    //                     resolve(validators);
    //                 }).catch(error => {
    //                     reject(error);
    //                 });
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } else {
    //             resolve(validators);
    //         }
    //     });
    // },

    // prepareWorkflowValidators: function () {
    //     return new Promise((resolve, reject) => {
    //         SERVICE.DefaultWorkflowHeadService.getTenantActiveWorkflowHeads(NODICS.getActiveTenants()).then(itemCodes => {
    //             SERVICE.DefaultWorkflowActionService.getTenantActiveWorkflowActions(NODICS.getActiveTenants(), itemCodes).then(itemCodes => {
    //                 SERVICE.DefaultWorkflowChannelService.getTenantActiveWorkflowChannels(NODICS.getActiveTenants(), itemCodes).then(itemCodes => {
    //                     this.buildWorkflowValidators(itemCodes).then(workflowInterceptors => {
    //                         this.interceptors = workflowInterceptors;
    //                         resolve(true);
    //                     }).catch(error => {
    //                         reject(error);
    //                     });
    //                 }).catch(error => {
    //                     reject(error);
    //                 });
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         }).catch(error => {
    //             reject(error);
    //         });
    //     });
    // },

    // getWorkflowDefaultQuery: function () {
    //     return {
    //         $and: [{
    //             active: true
    //         },
    //         {
    //             start: {
    //                 $lt: new Date()
    //             }
    //         },
    //         {
    //             $or: [{
    //                 end: {
    //                     $gte: new Date()
    //                 }
    //             },
    //             {
    //                 end: {
    //                     $exists: false
    //                 }
    //             }]
    //         }]
    //     };
    // },

    // getActionDefaultQuery: function () {
    //     return {
    //         $and: [{
    //             active: true
    //         },
    //         {
    //             start: {
    //                 $lt: new Date()
    //             }
    //         },
    //         {
    //             $or: [{
    //                 end: {
    //                     $gte: new Date()
    //                 }
    //             },
    //             {
    //                 end: {
    //                     $exists: false
    //                 }
    //             }]
    //         }]
    //     };
    // },

    // getChannelDefaultQuery: function () {
    //     return {
    //         $and: [{
    //             active: true
    //         },
    //         {
    //             start: {
    //                 $lt: new Date()
    //             }
    //         },
    //         {
    //             $or: [{
    //                 end: {
    //                     $gte: new Date()
    //                 }
    //             },
    //             {
    //                 end: {
    //                     $exists: false
    //                 }
    //             }]
    //         }]
    //     };
    // }
};