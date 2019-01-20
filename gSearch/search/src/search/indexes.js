/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

module.exports = {
    search: {
        order: {
            enabled: false,
            idPropertyName: 'code',
            preProcessor: 'DefaultEnterpriseIndexProcessorService.preEnterpriseIndexProcessor', // Will get executed just after data fetch from DB
            postProcessor: 'DefaultEnterpriseIndexProcessorService.postEnterpriseIndexProcessor', // will get executed once every data got collected and processed
            properties: {
                description: {
                    handler: 'DefaultEnterpriseIndexHandlerService.getEnterpriseDescription'
                },
                custom: {
                    enabled: true,
                    handler: 'DefaultEnterpriseIndexHandlerService.getEnterpriseCustom'
                }
            }
        }
    }
};