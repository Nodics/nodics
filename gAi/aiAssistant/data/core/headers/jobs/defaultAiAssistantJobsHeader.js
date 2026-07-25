/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/data/core/headers/jobs/DefaultAiAssistantJobsHeader
 * @description Imports inactive Assistant maintenance schedules through the existing CronJob schema authority.
 * @layer data
 * @owner aiAssistant
 * @override Projects may contribute later job records without adding another scheduler.
 */
module.exports = {
    aiAssistant: {
        assistantJobs: {
            options: {
                enabled: true, schemaName: 'cronJob', operation: 'saveAll',
                dataFilePrefix: 'defaultAiAssistantJobsData'
            },
            query: { code: '$code' }
        }
    }
};
