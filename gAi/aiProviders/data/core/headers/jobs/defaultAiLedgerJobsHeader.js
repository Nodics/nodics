/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/data/core/headers/jobs/DefaultAiLedgerJobsHeader
 * @description Contributes disabled AI ledger maintenance schedules to the existing CronJob schema authority.
 * @layer data
 * @owner aiProviders
 * @override Projects may activate or replace schedules while CronJob retains execution authority.
 */
module.exports = {
    aiProviders: {
        aiLedgerJobs: {
            options: {
                enabled: true, schemaName: 'cronJob', operation: 'saveAll',
                dataFilePrefix: 'defaultAiLedgerJobsData'
            },
            query: { code: '$code' }
        }
    }
};
