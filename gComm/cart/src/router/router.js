/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cart: {
        cartOperations: {
            createCart: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/create',
                method: 'PUT',
                controller: 'DefaultCartController',
                operation: 'createCart',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/cart/create',
                    body: {
                        //complete cart detail
                    }
                }
            },
            loadCartByRefCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/ref/:refCode',
                method: 'GET',
                controller: 'DefaultCartController',
                operation: 'loadCartByRefCode',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cart/ref/:refCode',
                }
            },
            loadCartByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/code/:code',
                method: 'GET',
                controller: 'DefaultCartController',
                operation: 'loadCartByCode',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cart/code/:code',
                }
            },
            loadCartByToken: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/token/:token',
                method: 'GET',
                controller: 'DefaultCartController',
                operation: 'loadCartByToken',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/cart/token/:token',
                }
            },
        },
        // customerValidations: {
        //     initEmailValidation: {
        //         secured: true,
        //         accessGroups: ['userGroup'],
        //         key: '/customer/validate',
        //         method: 'POST',
        //         controller: 'DefaultCustomerController',
        //         operation: 'validateCustomer',
        //         help: {
        //             requestType: 'secured',
        //             message: 'authToken need to set within header',
        //             method: 'POST',
        //             url: 'http://host:port/nodics/customer/validate',
        //             body: {
        //                 emailId: 'Login id',
        //                 orderToken: 'Token that been generated against order',
        //                 otp: 'Optional entered OTP'
        //                 // if order contains, validateCustomer false -> Return customer detail, without OTP validation
        //                 // else send OTP in email and ask customer to enter that
        //                 // once OTP generated, authenticate customer
        //             }
        //         }
        //     }
        // }
    }
};