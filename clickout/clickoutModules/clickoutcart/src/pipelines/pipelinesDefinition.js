/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cartValidatorPipeline: {
        nodes: {
            validatePayments: {
                type: 'function',
                handler: 'defaultValidateCartPipelineService.validatePayments',
                success: 'prepareToken'
            },
            prepareToken: {
                type: 'function',
                handler: 'defaultValidateCartPipelineService.prepareToken',
                success: 'validateCart'
            },
            validateCart: {
                type: 'function',
                handler: 'defaultValidateCartPipelineService.validateCart',
                success: 'successEnd'
            }

        }
    }
};