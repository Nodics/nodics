/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    dbs: {},
    interceptors: {},

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
        if (this.interceptors && !UTILS.isBlank(this.interceptors)) {
            return this.interceptors[itemCode];
        } else {
            return null;
        }
    },

    prepareWorkflowInterceptors: function () {
        return new Promise((resolve, reject) => {
            let items = [];
            SERVICE.DefaultWorkflowHeadService.getTenantActiveWorkflowHeads(NODICS.getActiveTenants(), items).then(done => {
                SERVICE.DefaultWorkflowActionService.getTenantActiveWorkflowActions(NODICS.getActiveTenants(), items).then(done => {
                    SERVICE.DefaultWorkflowChannelService.getTenantActiveWorkflowChannels(NODICS.getActiveTenants(), items).then(done => {
                        SERVICE.DefaultInterceptorConfigurationService.prepareInterceptors(
                            items,
                            ENUMS.InterceptorType.workflow.key
                        ).then(workflowInterceptors => {
                            this.interceptors = workflowInterceptors;
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    getWorkflowDefaultQuery: function () {
        return {
            $and: [{
                active: true
            },
            {
                start: {
                    $lt: new Date()
                }
            },
            {
                $or: [{
                    end: {
                        $gte: new Date()
                    }
                },
                {
                    end: {
                        $exists: false
                    }
                }]
            }]
        };
    },

    getActionDefaultQuery: function () {
        return {
            $and: [{
                active: true
            },
            {
                start: {
                    $lt: new Date()
                }
            },
            {
                $or: [{
                    end: {
                        $gte: new Date()
                    }
                },
                {
                    end: {
                        $exists: false
                    }
                }]
            }]
        };
    },

    getChannelDefaultQuery: function () {
        return {
            $and: [{
                active: true
            },
            {
                start: {
                    $lt: new Date()
                }
            },
            {
                $or: [{
                    end: {
                        $gte: new Date()
                    }
                },
                {
                    end: {
                        $exists: false
                    }
                }]
            }]
        };
    }
};