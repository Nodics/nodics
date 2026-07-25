/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantCronRecoveryContract
 * @description Verifies inactive idempotent core data, CronJob ownership, service-token routing, and timeout propagation.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const jobs = require('../data/core/data/jobs/defaultAiAssistantJobsData');
const header = require('../data/core/headers/jobs/defaultAiAssistantJobsHeader');
const routes = require('../src/router/routers').aiAssistant;

const job = jobs.turnRecovery;
assert.strictEqual(job.code, 'aiAssistantTurnRecoveryJob');
assert.strictEqual(job.active, false, 'OOTB recovery must require explicit operator activation');
assert.strictEqual(job.runOnInit, false);
assert.strictEqual(job.runOnNode, 'node0');
assert.strictEqual(job.jobDetail.internal.module, 'aiAssistant');
assert.strictEqual(job.jobDetail.internal.uri, '/internal/assistant/turns/recover');
assert.strictEqual(job.jobDetail.internal.method, 'POST');
assert(Number.isSafeInteger(job.jobDetail.internal.timeoutMs));
assert.strictEqual(header.aiAssistant.assistantJobs.options.schemaName, 'cronJob');
assert.strictEqual(header.aiAssistant.assistantJobs.query.code, '$code');
assert.strictEqual(routes.turns.recover.permissionConfig, 'authSecurity.internalToken.routePermission');

const captured = [];
global.CONFIG = { get: key => key === 'nodeId' ? 'node0' : undefined };
global.NODICS = { getInternalAuthToken: tenant => 'service-token-' + tenant };
global.SERVICE = {
    DefaultModuleService: {
        buildRequest: input => { captured.push(input); return input; }
    }
};
const handler = require('../../../gCore/cronjob/src/service/trigger/defaultCronJobTriggerHandlerService');
handler.prepareInternalURL({
    tenant: 'tenant-a',
    jobDetail: job.jobDetail
});
assert.strictEqual(captured[0].timeoutMs, 30000);
assert.strictEqual(captured[0].header.Authorization, 'Bearer service-token-tenant-a');
assert.strictEqual(captured[0].moduleName, 'aiAssistant');

console.log('AI Assistant CronJob recovery contract validated');
