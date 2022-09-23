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
                    carrier: {
                        code: workflowCarrier.code,
                        originalCode: workflowCarrier.originalCode,
                        activeHead: workflowCarrier.activeHead,
                        activeAction: workflowCarrier.activeAction.code,
                        type: workflowCarrier.type,
                        state: workflowCarrier.currentState
                    }
                }
            }, event);

            if ((!event.data.carrier.items || event.data.carrier.items.length <= 0) && workflowCarrier.items && workflowCarrier.items.length > 0) {
                event.data.carrier.items = workflowCarrier.items.map(item => {
                    return {
                        refId: item.refId
                    };
                });
            }
            if (workflowCarrier.actions && workflowCarrier.actions.length > 0) {
                event.data.carrier.actions = workflowCarrier.actions.map(action => {
                    return action.code;
                });
            }
            if (workflowCarrier.heads && workflowCarrier.heads.length > 0) {
                event.data.carrier.heads = workflowCarrier.heads;
            }
            if (workflowCarrier.activeAction.actionResponse) {
                event.data.actionResponse = workflowCarrier.activeAction.actionResponse;
            }
            if (workflowCarrier.event.isInternal) {
                this.publishInternalEvent(event, workflowCarrier).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                this.publishExternalEvent(event, workflowCarrier, workflowAction).then(success => {
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
                event.data.carrier.sourceDetail = workflowCarrier.sourceDetail;
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
                //console.log(util.inspect(event, showHidden = false, depth = 5, colorize = true));
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