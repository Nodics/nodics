/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

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
            resolve(true);
        });
    },

    /**
     * This function is used to assign single or multiple items to the workflow. Here items are restricted to belong same workflow only.
     * @param {*} request 
     */
    initItem: function (request) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('initWorkflowItemPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
            }
        });
    },

    /**
     * This function is used to assign single or multiple items to the workflow. Here items are restricted to belong same workflow only.
     * @param {*} request 
     */
    pauseItem: function (request) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('pauseWorkflowItemPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing pause item process'));
            }
        });
    },

    /**
     * This function is used to assign single or multiple items to the workflow. Here items are restricted to belong same workflow only.
     * @param {*} request 
     */
    resumeItem: function (request) {
        return new Promise((resolve, reject) => {
            try {
                request.loadInActive = true;
                SERVICE.DefaultPipelineService.start('resumeWorkflowItemPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing resume item process'));
            }
        });
    },

    /**
     * This funtion is used to assign item to next qalified action, based on evaluated channels 
     * @param {*} request 
     */
    nextAction: function (request) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('nextWorkflowActionPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
            }
        });
    },

    /**
     * This function is used to perform an action for item. If action is manual, action response is required
     * {
     *  decision: 'Decision that has been taken',
     *  feedback: 'Either json object or simple message'
     * }
     * @param {*} request 
     */
    performAction: function (request) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('performWorkflowActionPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
            }
        });
    },

    getWorkflowChain: function (request) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('loadWorkflowChainPipeline', request, {}).then(success => {
                    resolve({
                        code: 'SUC_SYS_00000',
                        result: success
                    });
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
            }
        });
    },


    handleItemChangeEvent: function (request) {
        return new Promise((resolve, reject) => {
            let event = request.event;
            let data = event.data;
            let allPromises = [];
            data.forEach(workflowItem => {
                workflowItem.tenant = workflowItem.tenant || request.tenant;
                allPromises.push(this.initItem(_.merge({
                    authData: request.authData
                }, workflowItem)));
            });
            if (allPromises.length > 0) {
                SERVICE.DefaultNodicsPromiseService.all(allPromises).then(success => {
                    resolve({
                        result: success.success,
                        errors: success.errors
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve({});
            }
        });
    },
};
