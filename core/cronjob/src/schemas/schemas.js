/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/*
http://localhost:3005/nodics/cronjob
    {
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
module.exports = {
    //Module Name
    cronjob: {
        email: {
            super: 'none',
            model: true,
            service: false,
            definition: {
                mailId: "String",
            }
        },
        trigger: {
            super: 'none',
            model: true,
            service: false,
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
                    default: false
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

        cronJob: {
            super: 'base',
            model: true,
            service: true,
            definition: {
                name: {
                    type: 'String',
                    unique: true,
                    required: true
                },
                state: {
                    type: 'String',
                    enum: ENUMS.CronJobState.getEnumValue(),
                    default: ENUMS.CronJobState.NEW
                },
                lastResult: {
                    type: 'String',
                    enum: ENUMS.CronJobStatus.getEnumValue(),
                    default: ENUMS.CronJobState.NEW
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
                clusterId: 'Number',
                priority: {
                    type: 'Number',
                    default: 1000
                },
                runOnInit: 'Boolean',
                emails: ["schemas['email']"],
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