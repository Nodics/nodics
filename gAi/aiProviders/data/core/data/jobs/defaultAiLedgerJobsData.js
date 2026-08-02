/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/data/core/data/jobs/DefaultAiLedgerJobsData
 * @description Defines disabled-by-default reservation expiry and ledger repair CronJob records.
 * @layer data
 * @owner aiProviders
 * @override Operations may activate and reschedule these jobs without moving ledger authority into CronJob.
 */
module.exports = {
    reservationExpiry: {
        code: 'aiTokenReservationExpiryJob', description: 'Expires unused AI token reservations',
        runOnNode: 'node0', runOnInit: false,
        active: false, logResult: true, priority: 500, status: 'NEW', state: 'NEW',
        jobDetail: {
            internal: {
                module: 'aiProviders', method: 'POST',
                uri: '/internal/ai-ledger/reservations/expire'
            }
        },
        trigger: { expression: '0 */5 * * * *' }
    },
    ledgerRepairScan: {
        code: 'aiTokenLedgerRepairScanJob', description: 'Runs dry-run-first AI ledger repair scanning',
        runOnNode: 'node0', runOnInit: false,
        active: false, logResult: true, priority: 600, status: 'NEW', state: 'NEW',
        jobDetail: {
            internal: {
                module: 'aiProviders', method: 'POST',
                uri: '/internal/ai-ledger/repair/scan',
                body: { scheduleCode: 'aiTokenLedgerRepairScanJob', dryRun: true }
            }
        },
        trigger: { expression: '0 */15 * * * *' }
    }
};
