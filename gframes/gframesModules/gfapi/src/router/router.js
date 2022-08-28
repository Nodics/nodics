/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
                    message: 'authToken need to set within header',
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