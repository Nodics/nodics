/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert'); const service = require('../src/service/defaultKycOperationsDashboardService');
describe('KYC operations dashboard contract', function () { it('returns bounded safe operational metrics and enforces permission', async function () { global.CONFIG = { get: () => ({ dashboardMaximumRecords: 10 }) }; const get = values => async () => ({ result: values }); global.SERVICE = { DefaultKycVerificationCaseService: { get: get([{ status: 'MANUAL_REVIEW_REQUIRED' }]) }, DefaultKycReviewTaskService: { get: get([{ status: 'OPEN', dueAt: new Date(Date.now() - 1000) }]) }, DefaultKycProviderService: { get: get([{ providerCode: 'mock', healthStatus: 'READY', productionReady: false, status: 'ACTIVE', secretReference: 'forbidden' }]) }, DefaultKycProviderExecutionAttemptService: { get: get([{ status: 'FAILED' }]) } }; const request = { tenant: 't1', tenantCode: 't1', enterpriseCode: 'e1', authData: { permissions: ['compliance.management.read'] } }; const result = await service.summarize(request); assert.strictEqual(result.cases.MANUAL_REVIEW_REQUIRED, 1); assert.strictEqual(result.sla.overdue, 1); assert.strictEqual(result.providers[0].secretReference, undefined); await assert.rejects(() => service.summarize(Object.assign({}, request, { authData: { permissions: [] } })), error => error.code === 'KYC_OPERATION_FORBIDDEN'); }); });
