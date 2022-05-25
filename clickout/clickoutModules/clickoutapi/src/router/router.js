/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    clickout: {
        cartOperations: {
            createCart: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cart/create',
                method: 'PUT',
                controller: 'DefaultCartController',
                operation: 'createCart',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/clickout/cart/create',
                    body: {
                        //complete cart detail
                    }
                }
            },
            loadCartByRefCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cart/ref/:refCode',
                method: 'GET',
                controller: 'DefaultCartController',
                operation: 'loadCartByRefCode',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/clickout/cart/ref/:refCode',
                }
            },
            loadCartByCode: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cart/code/:code',
                method: 'GET',
                controller: 'DefaultCartController',
                operation: 'loadCartByCode',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/clickout/cart/code/:code',
                }
            },
            loadCartByToken: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cart/token/:token',
                method: 'GET',
                controller: 'DefaultCartController',
                operation: 'loadCartByToken',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/clickout/cart/token/:token',
                }
            },
        },
    }
};