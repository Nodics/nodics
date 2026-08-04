/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/data/lifecycle/defaultOrderLifecycleReconciliationCronJobData @description Seeds disabled environment-layered lifecycle diagnostics scheduling. @layer data @owner order */
module.exports = { orderLifecycleReconciliationJob: { code: 'orderLifecycleReconciliationJob', description: 'Scans bounded Order lifecycle SLA and reconciliation findings without guessing owner outcomes.', runOnNode: 'node0', active: false, logResult: true, jobDetail: { startNode: 'DefaultOrderLifecycleDiagnosticsService.run', body: { tenant: 'default', enterpriseCode: 'default' } }, trigger: { expression: '0 */15 * * * *' }, event: { executed: true, completed: false, targetModule: 'order', eventType: 'ASYNC' }, priority: 760, status: 'NEW', state: 'NEW' } };
