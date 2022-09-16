/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    kycapi: {
        initKycWorkflow: {
            initMobileKyc: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/mobile/init',
                method: 'POST',
                controller: 'DefaultMobileKycWorkflowController',
                operation: 'initMobileKyc',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/v0/mobile/init',
                    body: {
                        carrier: {
                            code: 'Required carrier code Optional',
                            sourceDetail: {
                                schemaName: 'Either schema name or index name, in case internal',
                                moduleName: 'Required module name, in case internal'
                            },
                            event: {
                                enabled: 'true or false'
                            },
                            items: [{
                                code: 'Required item code {loginId}',
                                callbackData: 'Any JSON object needs to be send back along with each events',
                                itemDetail: 'Complete item detail, which required on workflow action to perform'
                            }]
                        },
                    }
                }
            }
        }
    }
};