/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    flowApi: {
        workflowCarrierOperations: {
            initCarrierItem: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/carrier/init',
                method: 'PUT',
                controller: 'DefaultWorkflowController',
                operation: 'initCarrier',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'put',
                    url: 'http://host:port/nodics/workflow/carrier/init',
                    body: {
                        workflowCode: 'Workflow code, these items needs to be associated',
                        releaseCarrier: 'true/false, if we need to release carrier immediatly',
                        carrier: {
                            code: 'optional carrier code generate if blank',
                            event: {
                                enabled: 'true or false'
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
            },
            releaseCarrier: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/carrier/release/:carrierCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'releaseCarrier',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/carrier/release/:carrierCode',
                    body: {
                        comment: 'Comments for this action'
                    }
                }
            },
            updateCarrier: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/carrier/update',
                method: 'PUT',
                controller: 'DefaultWorkflowController',
                operation: 'updateCarrier',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'put',
                    url: 'http://host:port/nodics/workflow/carrier/add',
                    body: {
                        carrierCode: 'Required carrier code',
                        event: {
                            enabled: 'true/false'
                        },
                        items: [{
                            code: 'Required item code',
                            refId: 'external item reference id',
                            callbackData: 'Any JSON object needs to be send back along with each events',
                            itemDetail: 'Complete item detail, which required on workflow action to perform'
                        }]
                    }
                }
            },
        },
        workflowActionOperations: {
            performAction: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/action/process/:carrierCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'performAction',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/action/process/:carrierCode',
                    body: {
                        decision: 'Decision that has been taken',
                        feedback: 'Either json object or simple message'
                    }
                }
            }
        },
    }
}