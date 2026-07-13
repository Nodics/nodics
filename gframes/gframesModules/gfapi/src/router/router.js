/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gframes/gframesModules/gfapi/src/router/router
 * @description Defines gframesModules route registration and HTTP exposure metadata.
 * @layer router
 * @owner gframesModules
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    gfapi: {
        customerValidations: {
            initEmailValidation: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/customer/validate',
                method: 'POST',
                controller: 'DefaultCustomerController',
                operation: 'validateCustomer',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/customer/validate',
                    body: {
                        emailId: 'Login id',
                        orderToken: 'Token that been generated against order',
                        otp: 'Optional entered OTP'
                    }
                }
            }
        }
    }
};