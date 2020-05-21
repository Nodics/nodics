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

    createEventName: function (preFix, workflowCode, postFix) {
        return preFix + workflowCode.toUpperCaseFirstChar() + postFix.toUpperCaseFirstChar();
    },

    publishWorkflowEvent: function (event, schemaDef, models) {
        return new Promise((resolve, reject) => {
            if (!event.data) event.data = [];
            schemaDef.workflows.forEach(workflow => {
                event.data.push({
                    workflowCode: workflow.workflowCode,
                    releaseCarrier: false,
                    carrier: SERVICE[workflow.sourceBuilder.carrierBuilder].buildCarrier(schemaDef, models[0], workflow),
                    items: SERVICE[workflow.sourceBuilder.carrierBuilder].buildItems(schemaDef, models, workflow)
                });
            });
            this.LOG.debug('Pushing event for item initialize in workflow : ' + schemaDef.schemaName);
            console.log('-------------------------------------------------------------');
            console.log(event);
            console.log('-------------------------------------------------------------');
            resolve(true);
            // SERVICE.DefaultEventService.publish(event).then(success => {
            //     resolve(success);
            // }).catch(error => {
            //     reject(error);
            // });
        });
    }
};