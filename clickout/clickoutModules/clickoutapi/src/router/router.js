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
            createLoad: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/cart/load',
                method: 'POST',
                controller: 'DefaultCartController',
                operation: 'loadCart',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/clickout/cart/load',
                    body: {
                        options: {},
                        query: {}
                    }
                }
            },
        },
    }
};