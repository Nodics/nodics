/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    customerRegistrationHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCustomerRegistrationService.validateRequest',
                success: 'validateIfCustomerExist'
            },
            validateIfCustomerExist: {
                type: 'function',
                handler: 'DefaultCustomerRegistrationService.validateIfCustomerExist',
                success: 'validateConfirmPassword'
            },
            validateConfirmPassword: {
                type: 'function',
                handler: 'DefaultCustomerRegistrationService.validateConfirmPassword',
                success: 'createCustomer'
            },
            createCustomer: {
                type: 'function',
                handler: 'DefaultCustomerRegistrationService.createCustomer',
                success: 'successEnd'
            },
            initMobileKyc: {
                type: 'function',
                handler: 'DefaultCustomerRegistrationService.initMobileKyc',
                success: 'initEmailKyc'
            },
            initEmailKyc: {
                type: 'function',
                handler: 'DefaultCustomerRegistrationService.initEmailKyc',
                success: 'initDocumentKyc'
            },
            initDocumentKyc: {
                type: 'function',
                handler: 'DefaultCustomerRegistrationService.initDocumentKyc',
                success: 'eventCustomerRegistered'
            },
            eventCustomerRegistered: {
                type: 'function',
                handler: 'DefaultCustomerRegistrationService.eventCustomerRegistered',
                success: 'successEnd'
            }
        }
    },
};