/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module kycCore/data/lifecycle/DefaultKycLifecycleCronJobData @description Seeds the disabled, environment-layered KYC lifecycle schedule under CronJob ownership. @layer data @owner kycCore @override Environment or customer modules may activate, reschedule, or re-scope this job without editing KYC core. */
module.exports = { kycLifecycleGovernanceJob: { code: 'kycLifecycleGovernanceJob', description: 'Runs bounded KYC expiry, re-verification, retention, legal-hold, and nMedia deletion coordination.', runOnNode: 'node0', active: false, logResult: true, jobDetail: { startNode: 'DefaultKycLifecycleGovernanceService.run', body: { tenant: 'default', enterpriseCode: 'default' } }, trigger: { expression: '0 0 * * * *' }, event: { executed: true, completed: false, targetModule: 'kycCore', eventType: 'ASYNC' }, priority: 770, status: 'NEW', state: 'NEW' } };
