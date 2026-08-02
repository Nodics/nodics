/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
