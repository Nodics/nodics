/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/data/lifecycle/defaultOrderLifecycleReconciliationCronJobHeader @description Imports the disabled lifecycle diagnostics CronJob into CronJob ownership. @layer data @owner order */
module.exports = { cronjob: { defaultOrderLifecycleReconciliationCronJob: { options: { enabled: true, schemaName: 'cronJob', operation: 'saveAll', dataFilePrefix: 'defaultOrderLifecycleReconciliationCronJobData' }, query: { code: '$code' } } } };
