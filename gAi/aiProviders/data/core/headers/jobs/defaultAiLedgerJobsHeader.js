/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
