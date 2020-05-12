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

    publishEvent: function (event, workflowAction, workflowCarrier) {
        return new Promise((resolve, reject) => {
            event = _.merge({
                sourceName: 'workflow',
                sourceId: CONFIG.get('nodeId'),
                state: "NEW",
                active: true,
                data: {
                    code: workflowCarrier.code,
                    activeHead: workflowCarrier.activeHead,
                    activeAction: workflowCarrier.activeAction.code,
                    state: workflowCarrier.state
                }
            }, event);
            if (workflowCarrier.activeAction && workflowCarrier.activeAction.actionResponse) {
                event.data.actionResponse = workflowCarrier.activeAction.actionResponse;
            }
            if (workflowCarrier.sourceDetail && !UTILS.isBlank(workflowCarrier.sourceDetail)) {
                event.data.sourceDetail = workflowCarrier.sourceDetail;
            }
            if (workflowCarrier.event.type === 'EXTERNAL') {
                this.publishExternalEvent(event, workflowCarrier, workflowAction).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                this.publishInternalEvent(event, workflowCarrier).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    publishInternalEvent: function (event, workflowCarrier) {
        return new Promise((resolve, reject) => {
            try {
                event.event = this.createEventName((workflowCarrier.sourceDetail.schemaName || workflowCarrier.sourceDetail.indexName), workflowCarrier.activeHead, event.event);
                event.target = workflowCarrier.sourceDetail.moduleName;
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

    publishExternalEvent: function (event, workflowCarrier, workflowAction) {
        return new Promise((resolve, reject) => {
            try {
                let endPoint = _.merge(_.merge({}, workflowAction.sourceDetail.endPoint || {}), workflowCarrier.sourceDetail.endPoint || {});
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