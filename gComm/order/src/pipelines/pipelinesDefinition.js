/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    createOrderPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateRequest',
                success: 'validateMandateValues'
            },
            validateMandateValues: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateMandateValues',
                success: 'validateItems'
            },
            validateItems: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateItems',
                success: 'validateConsignments'
            },
            validateConsignments: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateConsignments',
                success: 'validatePayments'
            },
            validatePayments: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validatePayments',
                success: 'validateOrder'
            },
            validateOrder: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateOrder',
                success: 'saveOrder'
            },
            saveOrder: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.saveOrder',
                success: 'postValidation'
            },
            postValidation: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.postValidation',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.handleErrorEnd'
            }
        }
    }
};