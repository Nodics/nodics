/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');

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

    publishEvent: function (event, workflowAction, workflowItem) {
        return new Promise((resolve, reject) => {
            event = _.merge({
                sourceName: 'workflow',
                sourceId: CONFIG.get('nodeId'),
                state: "NEW",
                active: true,
                data: {
                    code: workflowItem.code,
                    activeHead: workflowItem.activeHead.code,
                    activeAction: workflowItem.activeAction.code,
                    state: workflowItem.state
                }
            }, event);
            if (workflowItem.activeAction && workflowItem.activeAction.actionResponse) {
                event.data.actionResponse = workflowItem.activeAction.actionResponse;
            }
            if (workflowItem.detail && !UTILS.isBlank(workflowItem.detail)) {
                event.data.detail = workflowItem.detail;
            }
            if (workflowItem.sourceDetail && !UTILS.isBlank(workflowItem.sourceDetail)) {
                event.data.sourceDetail = workflowItem.sourceDetail;
            }
            if (workflowItem.callbackData && !UTILS.isBlank(workflowItem.callbackData)) {
                event.data.callbackData = workflowItem.callbackData;
            }
            if (workflowItem.type === ENUMS.WorkflowItemType.EXTERNAL.key) {
                this.publishExternalEvent(event, workflowItem, workflowAction).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                this.publishInternalEvent(event, workflowItem).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    publishInternalEvent: function (event, workflowItem) {
        return new Promise((resolve, reject) => {
            try {
                event.event = this.createEventName((workflowItem.sourceDetail.schemaName || workflowItem.sourceDetail.indexName), workflowItem.activeHead.code, event.event);
                event.target = workflowItem.sourceDetail.moduleName;
                event.targetType = ENUMS.TargetType.MODULE.key;
                SERVICE.DefaultEventService.publish(event).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    publishExternalEvent: function (event, workflowItem, workflowAction) {
        return new Promise((resolve, reject) => {
            try {
                let endPoint = _.merge(_.merge({}, workflowAction.sourceDetail.endPoint || {}), workflowItem.sourceDetail.endPoint || {});
                event.targetType = ENUMS.TargetType.EXTERNAL.key;
                event.target = {
                    header: endPoint.header,
                    uri: endPoint.uri,
                    methodName: endPoint.methodName,
                    responseType: endPoint.responseType,
                    params: endPoint.params
                };
                SERVICE.DefaultEventService.publish(event).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
};