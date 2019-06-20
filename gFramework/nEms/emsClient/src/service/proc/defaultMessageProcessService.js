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
            process.error(request, response, 'Invalid queue detail');
        } else if (!request.message) {
            process.error(request, response, 'Invalid queue detail');
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
                    process.error(request, response, 'Faild on converting message to JSON format : ' + queue.name);
                }
            }).catch(error => {
                this.LOG.error('Failed to publish message : ' + queue.name + ' : ERROR is ', error);
                process.error(request, response, 'Failed to convert message for queue : ' + queue.name);
            });
        } else {
            process.error(request, response, 'Invalid message handller: ' + queue.options.messageHandler);
        }
    },

    validateData: function (request, response, process) {
        let queue = request.queue;
        let message = request.message;
        if (queue.options.requiredMandateProperties && (!message.enterpriseCode || !message.tenant)) {
            process.error(request, response, 'Message should contain enterpriseCode and tenant');
        } else {
            message.enterpriseCode = message.enterpriseCode || queue.options.header.enterpriseCode || 'default';
            message.tenant = message.tenant || queue.options.header.tenant || 'default';
            process.nextSuccess(request, response);
        }
    },

    publishEvent: function (request, response, process) {
        let queue = request.queue;
        let message = request.message;
        this.LOG.debug('Pushing event recieved message from  : ', queue.name);
        let event = {
            enterpriseCode: message.enterpriseCode,
            tenant: message.tenant,
            event: queue.options.eventName || queue.name,
            source: queue.options.source,
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
                process.error(request, response, error);
            });
        } else {
            SERVICE.DefaultEventService.handleEvent({
                enterpriseCode: event.enterpriseCode,
                tenant: event.tenant,
                event: event
            }).then(success => {
                this.LOG.debug('Message published successfully');
                process.nextSuccess(request, response);
            }).catch(error => {
                this.LOG.error('Message publishing failed: ', error);
                process.error(request, response, error);
            });
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};