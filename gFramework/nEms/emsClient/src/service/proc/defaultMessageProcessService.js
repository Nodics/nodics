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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating message handler request');
        if (!request.queue) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid queue detail'));
        } else if (!request.message) {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid queue detail'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    processMessage: function (request, response, process) {
        this.LOG.debug('Applying message translator');
        let queue = request.queue;
        let messageHandlerPipeline = CONFIG.get('emsClient').messageHandlers[queue.options.messageHandler] || 'jsonMessageHandler';
        if (messageHandlerPipeline) {
            SERVICE.DefaultPipelineService.start(messageHandlerPipeline, {
                queue: queue,
                message: request.message
            }, {}).then(success => {
                if (success.success) {
                    request.message = success.result;
                    process.nextSuccess(request, response);
                } else {
                    this.LOG.error('Faild on converting message to JSON format');
                    process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Faild on converting message to JSON format : ' + queue.name));
                }
            }).catch(error => {
                this.LOG.error('Failed to publish message : ' + queue.name + ' : ERROR is ', error);
                process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Failed to convert message for queue : ' + queue.name));
            });
        } else {
            process.error(request, response, new CLASSES.NodicsError('ERR_EMS_00000', 'Invalid message handller: ' + queue.options.messageHandler));
        }
    },

    validateData: function (request, response, process) {
        let queue = request.queue;
        let message = request.message;
        if (queue.options.tenantRestricted) {
            message.tenant = queue.options.header.tenant;
        } else {
            message.tenant = message.tenant || queue.options.header.tenant || 'default';
            process.nextSuccess(request, response);
        }
    },

    publishEvent: function (request, response, process) {
        let queue = request.queue;
        let message = request.message;
        this.LOG.debug('Pushing event recieved message from  : ' + queue.name);
        let event = {
            tenant: message.tenant,
            event: queue.options.eventName || queue.name,
            sourceName: queue.options.source,
            sourceId: CONFIG.get('nodeId'),
            target: queue.options.target,
            nodeId: queue.options.nodeId,
            state: "NEW",
            type: queue.options.eventType,
            active: true,
            header: queue.options.header,
            data: message
        };
        if (queue.options.target && !NODICS.isModuleActive(queue.options.target)) {
            SERVICE.DefaultEventService.publish(event).then(success => {
                this.LOG.debug('Message published successfully');
                process.nextSuccess(request, response);
            }).catch(error => {
                this.LOG.error('Message publishing failed: ', error);
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_EMS_00001'));
            });
        } else {
            SERVICE.DefaultEventService.handleEvent({
                tenant: event.tenant,
                event: event
            }).then(success => {
                this.LOG.debug('Message published successfully');
                process.nextSuccess(request, response);
            }).catch(error => {
                this.LOG.error('Message publishing failed: ', error);
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_EMS_00001'));
            });
        }
    }
};