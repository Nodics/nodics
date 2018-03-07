/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    cronjob: {
        eventPublishJob: {
            modelName: 'cronJob',
            operation: 'saveOrUpdate', //save, update and saveOrUpdate
            tenant: 'default',

            models: {
                testJob1: {
                    _id: '5a9e7dd88ac6ed3d73a76714',
                    enterpriseCode: 'default',
                    tenant: "default",
                    name: "testJob1",
                    clusterId: 0,
                    runOnInit: false,
                    jobDetail: {
                        "startNode": "SERVICE.EventHandlerJobService.runJob"
                    },
                    triggers: [{
                        isActive: true,
                        triggerId: "testTrigger",
                        expression: "0 */1 * * * *"
                    }],
                    emails: [{
                        "email": "nodics.framework@nodics.com"
                    }],
                    active: {
                        start: new Date(),
                        end: new Date()
                    },
                    priority: 1000,
                    lastResult: "NEW",
                    state: "NEW",
                    testProperty: "Dwivedi Himkar"
                },
                testJob11: {
                    _id: '5a9e7dd88ac6ed3d73a76714',
                    enterpriseCode: 'default',
                    tenant: "default",
                    name: "testJob1",
                    clusterId: 0,
                    runOnInit: false,
                    jobDetail: {
                        "startNode": "SERVICE.EventHandlerJobService.runJob"
                    },
                    triggers: [{
                        isActive: true,
                        triggerId: "testTrigger",
                        expression: "0 */1 * * * *"
                    }],
                    emails: [{
                        "email": "nodics.framework@nodics.com"
                    }],
                    active: {
                        start: new Date(),
                        end: new Date()
                    },
                    priority: 1000,
                    lastResult: "NEW",
                    state: "NEW",
                    testProperty: "Dwivedi Himkar"
                },
                testJob2: {
                    _id: '5a9e7dd88ac6ed3d73a76715',
                    enterpriseCode: 'default',
                    tenant: "default",
                    name: "testJob2",
                    clusterId: 0,
                    runOnInit: false,
                    jobDetail: {
                        "startNode": "SERVICE.EventHandlerJobService.runJob"
                    },
                    triggers: [{
                        isActive: false,
                        triggerId: "testTrigger15",
                        expression: "0 */1 * * * *"
                    }, {
                        isActive: true,
                        triggerId: "testTrigger16",
                        expression: "0 */1 * * * *"
                    }],
                    emails: [{
                        "email": "nodics.framework@nodics.com"
                    }],
                    active: {
                        start: new Date(),
                        end: new Date(Date.now() - 86400000)
                    },
                    priority: 1000,
                    lastResult: "NEW",
                    state: "NEW",
                    testProperty: "Dwivedi Himkar"
                },
                testJob3: {
                    _id: '5a9e7dd88ac6ed3d73a76716',
                    enterpriseCode: 'default',
                    tenant: "default",
                    name: "testJob3",
                    clusterId: 0,
                    runOnInit: false,
                    jobDetail: {
                        "startNode": "SERVICE.EventHandlerJobService.runJob"
                    },
                    triggers: [{
                        isActive: false,
                        triggerId: "testTrigger13",
                        expression: "0 */1 * * * *"
                    }, {
                        isActive: false,
                        triggerId: "testTrigger14",
                        expression: "0 */1 * * * *"
                    }],
                    emails: [{
                        "email": "nodics.framework@nodics.com"
                    }],
                    active: {
                        start: new Date(),
                        end: new Date(Date.now() + 86400000)
                    },
                    priority: 1000,
                    lastResult: "NEW",
                    state: "NEW",
                    testProperty: "Dwivedi Himkar"
                },
                testJob4: {
                    _id: '5a9e7dd88ac6ed3d73a76717',
                    enterpriseCode: 'default',
                    tenant: "default",
                    name: "testJob4",
                    clusterId: 0,
                    runOnInit: false,
                    jobDetail: {
                        "startNode": "SERVICE.EventHandlerJobService.runJob"
                    },
                    triggers: [{
                        isActive: true,
                        triggerId: "testTrigger13",
                        expression: "0 */1 * * * *"
                    }, {
                        isActive: true,
                        triggerId: "testTrigger14",
                        expression: "0 */1 * * * *"
                    }],
                    emails: [{
                        "email": "nodics.framework@nodics.com"
                    }],
                    active: {
                        start: new Date(),
                        end: new Date(Date.now() + (86400000 * 10))
                    },
                    priority: 1000,
                    lastResult: "NEW",
                    state: "NEW",
                    testProperty: "Dwivedi Himkar"
                },
                testJob5: {
                    _id: '5a9e7dd88ac6ed3d73a76718',
                    enterpriseCode: 'default',
                    tenant: "default",
                    name: "testJob5",
                    clusterId: 0,
                    runOnInit: false,
                    jobDetail: {
                        "startNode": "SERVICE.EventHandlerJobService.runJob"
                    },
                    triggers: [{
                        isActive: false,
                        triggerId: "testTrigger13",
                        expression: "0 */1 * * * *"
                    }, {
                        isActive: false,
                        triggerId: "testTrigger14",
                        expression: "0 */1 * * * *"
                    }],
                    emails: [{
                        "email": "nodics.framework@nodics.com"
                    }],
                    active: {
                        start: new Date(),
                        end: new Date(Date.now() + 86400000 * 2)
                    },
                    priority: 1000,
                    lastResult: "NEW",
                    state: "NEW",
                    testProperty: "Dwivedi Himkar"
                }
            }
        }
    }
    /*
        cronjob: {
            eventPublishJob: {
                name: 'something 1'
            },
            eventPublishJob1: {
                name: 'something 1'
            },
            eventPublishJob2: {
                name: 'something 1'
            },
            eventPublishJob3: {
                name: 'something 1'
            }
        },
        cronjob1: {
            eventPublishJob: {
                name: 'something 1'
            },
            eventPublishJob1: {
                name: 'something 1'
            },
            eventPublishJob2: {
                name: 'something 1'
            },
            eventPublishJob3: {
                name: 'something 1'
            }
        },
        cronjob2: {
            eventPublishJob: {
                name: 'something 1'
            },
            eventPublishJob1: {
                name: 'something 1'
            },
            eventPublishJob2: {
                name: 'something 1'
            },
            eventPublishJob3: {
                name: 'something 1'
            }
        }
    */
};