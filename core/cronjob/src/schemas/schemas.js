/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/*
    http://localhost:3005/nodics/cronjob {
        "code": "101",
        "state": "NEW",
        "clusterId": "0",
        "priority": "10",
        "cronjobtmp": [{
            "name": "Nodics Framework"
        }],
        "triggers": [{
            "triggerId": "testTrigger",
            "triggerName": "testTrigger",
            "second": "0",
            "minute": "0",
            "hour": "0",
            "day": "10",
            "month": "02",
            "year": "03"
        }]
    }
    // just for test
*/

let mongoose = require('mongoose');

module.exports = {
    cronjob: {
        trigger: {
            super: 'none',
            model: true,
            service: false,
            router: false,
            definition: {
                triggerId: {
                    type: 'String',
                    unique: true,
                    required: true
                },
                triggerName: {
                    type: 'String'
                },
                triggerType: {
                    type: 'String',
                    enum: ENUMS.TriggerType.getEnumValue(),
                    default: ENUMS.TriggerType.NEW
                },
                isActive: {
                    type: 'Boolean',
                    default: false,
                    required: true
                },
                second: {
                    type: 'String'
                },
                minute: {
                    type: 'String'
                },
                hour: {
                    type: 'String'
                },
                day: {
                    type: 'String'
                },
                month: {
                    type: 'String'
                },
                year: {
                    type: 'String'
                },
                expression: {
                    type: 'String'
                }
            }
        },

        cronJobLog: {
            super: 'base',
            model: true,
            service: false,
            event: false,
            router: false,
            definition: {
                log: {
                    type: 'String'
                }
            }
        },

        cronJob: {
            super: 'base',
            model: true,
            service: true,
            event: false,
            router: true,
            refSchema: {
                logs: {
                    modelName: 'CronJobLogModel',
                    type: 'many'
                }
            },
            virtualProperties: {
                fullname: 'CronJobVirtualService.getFullName',
                jobDetail: {
                    fullname: 'CronJobVirtualService.getFullName'
                }
            },
            definition: {
                name: {
                    type: 'String',
                    unique: true,
                    required: true
                },
                tenant: {
                    type: 'String',
                    required: true
                },
                state: {
                    type: 'String',
                    enum: ENUMS.CronJobState.getEnumValue(),
                    default: ENUMS.CronJobState.NEW.key
                },
                lastResult: {
                    type: 'String',
                    enum: ENUMS.CronJobStatus.getEnumValue(),
                    default: ENUMS.CronJobStatus.NEW.key
                },
                lastStartTime: {
                    type: 'Date'
                },
                lastEndTime: {
                    type: 'Date'
                },
                lastSuccessTime: {
                    type: 'Date'
                },
                clusterId: {
                    type: 'Number'
                },
                priority: {
                    type: 'Number',
                    default: 1000
                },
                runOnInit: {
                    type: 'Boolean'
                },
                saveLog: {
                    type: 'Boolean'
                },
                logs: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'CronJobLogModel'
                }],
                emails: [{
                    email: {
                        type: 'String'
                    }
                }],
                active: {
                    start: {
                        type: 'Date',
                        required: true
                    },
                    end: {
                        type: 'Date'
                    }
                },
                triggers: ["schemas['trigger']"],
                jobDetail: {
                    startNode: {
                        type: 'String',
                        required: true
                    },
                    endNode: {
                        type: 'String'
                    },
                    errorNode: {
                        type: 'String'
                    }
                }
            }
        }
    }
};