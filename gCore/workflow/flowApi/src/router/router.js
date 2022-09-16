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
            },
            fillCarrier: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/carrier/add',
                method: 'PUT',
                controller: 'DefaultWorkflowController',
                operation: 'addItemToCarrier',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'put',
                    url: 'http://host:port/nodics/workflow/carrier/add',
                    body: {
                        carrierCode: 'Required carrier code',
                        items: [{
                            code: 'Required item code',
                            refId: 'external item reference id',
                            callbackData: 'Any JSON object needs to be send back along with each events',
                            itemDetail: 'Complete item detail, which required on workflow action to perform'
                        }]
                    }
                }
            },
            blockCarrier: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/carrier/block/:carrierCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'blockCarrier',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/carrier/block/:carrierCode',
                    body: {
                        comment: 'Comments for this action'
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
            pauseCarrier: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/carrier/pause/:carrierCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'pauseCarrier',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/carrier/pause/:carrierCode',
                    body: {
                        comment: 'Comments for this action'
                    }
                }
            },
            resumeCarrier: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/carrier/resume/:carrierCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'resumeCarrier',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/carrier/resume/:carrierCode',
                    body: {
                        comment: 'Comments for this action'
                    }
                }
            }
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
        retrieveWorkflow: {
            getWorkflowChain: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/chain/:workflowCode',
                method: 'GET',
                controller: 'DefaultWorkflowController',
                operation: 'getWorkflowChain',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/workflow/chain/:workflowCode',
                }
            },
            getWorkflowsChain: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/chain',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'getWorkflowChain',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/chain',
                    body: {
                        options: {
                            recursive: 'true/false and other serach options'
                        },
                        query: 'Query object to find workflows'
                    }
                }
            }
        }
    }
};