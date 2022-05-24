/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    clickout: {
        orderOperations: {
            createOrder: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/order/create',
                method: 'PUT',
                controller: 'DefaultOrderController',
                operation: 'createOrder',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'Post',
                    url: 'http://host:port/nodics/clickout/order/create',
                    body: {
                        //complete order detail
                    }
                }
            },
        },
    }
};