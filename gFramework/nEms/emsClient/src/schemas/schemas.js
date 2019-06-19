/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    emsClient: {
        emsFailedMessages: {
            super: 'super',
            model: true,
            service: true,
            event: false,
            router: true,
            search: {
                enabled: true,
                idPropertyName: '_id',
            },
            definition: {
                enterpriseCode: {
                    required: false,
                    description: 'Define enterprise code'
                }
            }
        }
    }
};