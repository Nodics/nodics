/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cronjob: {
        trigger: {
            super: 'none',
            model: true,
            service: false,
            router: false
        },

        cronJobLog: {
            super: 'base',
            model: true,
            service: false,
            event: false,
            router: false
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
            }
        },

        importCronJob: {
            super: 'cronJob',
            model: true,
            service: true,
            event: false,
            router: true
        }
    }
};