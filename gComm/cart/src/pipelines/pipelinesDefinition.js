/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    cartValidatorPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'defaultValidateCartPipelineService.validateRequest',
                success: 'validateMandateValues'
            },
            validateMandateValues: {
                type: 'function',
                handler: 'defaultValidateCartPipelineService.validateMandateValues',
                success: 'validateItems'
            },
            validateItems: {
                type: 'function',
                handler: 'defaultValidateCartPipelineService.validateItems',
                success: 'validateConsignments'
            },
            validateConsignments: {
                type: 'function',
                handler: 'defaultValidateCartPipelineService.validateConsignments',
                success: 'validatePayments'
            },
            validatePayments: {
                type: 'function',
                handler: 'defaultValidateCartPipelineService.validatePayments',
                success: 'validateCart'
            },
            validateCart: {
                type: 'function',
                handler: 'defaultValidateCartPipelineService.validateCart',
                success: 'successEnd'
            }

        }
    },
    createCartPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCreateCartPipelineService.validateRequest',
                success: 'validateCart'
            },
            validateCart: {
                type: 'process',
                handler: 'cartValidatorPipeline',
                success: 'saveCart'
            },
            saveCart: {
                type: 'function',
                handler: 'DefaultCreateCartPipelineService.saveCart',
                success: 'postValidation'
            },
            postValidation: {
                type: 'function',
                handler: 'DefaultCreateCartPipelineService.postValidation',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCreateCartPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCreateCartPipelineService.handleErrorEnd'
            }
        }
    },
    // cartValidatorPipeline: {
    //     nodes: {
    //         validatePayments: {
    //             type: 'function',
    //             handler: 'defaultValidateCartPipelineService.validatePayments',
    //             success: 'prepareToken'
    //         },
    //         prepareToken: {
    //             type: 'function',
    //             handler: 'defaultValidateCartPipelineService.prepareToken',
    //             success: 'validateCart'
    //         },
    //         validateCart: {
    //             type: 'function',
    //             handler: 'defaultValidateCartPipelineService.validateCart',
    //             success: 'successEnd'
    //         }

    //     }
    // }
};