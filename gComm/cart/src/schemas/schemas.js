/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    cart: {
        cart: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            cache: {
                enabled: false,
                ttl: 360
            },
            search: {
                enabled: false,
                idPropertyName: 'code'
            },
            definition: {
                entCode: {
                    type: 'string',
                    required: true,
                    description: 'Enterprise code that order belongs',
                    searchOptions: {
                        enabled: true
                    }
                }
            }
        }
    }
};