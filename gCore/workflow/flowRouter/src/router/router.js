/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    workflow: {
        workflowItemOperations: {
            initCarrierItem: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/carrier/init',
                method: 'PUT',
                controller: 'DefaultWorkflowController',
                operation: 'initCarrierItem',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'put',
                    url: 'http://host:port/nodics/workflow/carrier/init',
                    body: {
                        workflowCode: 'Workflow code, these items needs to be associated',
                        releaseCarrier: 'true/false, if we need to release carrier immediatly',
                        carrier: {
                            code: 'Required carrier code',
                            sourceDetail: {
                                schemaName: 'Either schema name or index name, in case internal',
                                indexName: 'Either schema name or index name, in case internal',
                                moduleName: 'Required module name, in case internal',
                                endPoint: 'In case external item'
                            },
                            event: {
                                enabled: 'true or false'
                            }
                        },
                        items: [{
                            code: 'Required item code',
                            refId: 'external item reference id',
                            callbackData: 'Any JSON object needs to be send back along with each events',
                            itemDetail: 'Complete item detail, which required on workflow action to perform'
                        }]
                    }
                }
            }
        }
    }
};