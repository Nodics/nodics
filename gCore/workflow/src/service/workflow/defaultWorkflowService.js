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
        SERVICE.DefaultPipelineService.start('initWorkflowItemPipeline', {
            tenant: request.tenant,
            itemType: request.itemType,
            item: request.item,
            workflowCode: request.workflowCode
        }, {}).then(success => {
            resolve(success);
        }).catch(error => {
            reject(error);
        });
    },

    /**
     * This funtion is used to assign item to next qalified action, based on evaluated channels 
     * @param {*} request 
     */
    nextAction: function (request) {
        SERVICE.DefaultPipelineService.start('nextWorkflowActionPipeline', {
            tenant: request.tenant,

            itemCode: request.itemCode,
            workflowItem: request.workflowItem,

            workflowCode: request.workflowCode,
            workflowHead: request.workflowHead,


            actionCode: request.actionCode
        }, {}).then(success => {
            resolve(success);
        }).catch(error => {
            reject(error);
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
            SERVICE.DefaultPipelineService.start('performWorkflowActionPipeline', {
                tenant: request.tenant,
                itemCode: request.itemCode,
                actionResponse: request.actionResponse,

                workflowItem: request.workflowItem,
                actionCode: request.actionCode,
                workflowAction: request.workflowAction,
                workflowCode: request.workflowCode,
                workflowHead: request.workflowHead


            }, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * This function is used to evaluate associated channels and process them
     * @param {*} request 
     */
    processChannels: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('evaluateChannelsPipeline', {
                tenant: request.tenant,
                itemCode: request.itemCode
            }, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },
};
