/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/service/lifecycle/DefaultOrderLifecycleDiagnosticsService @description Produces bounded lifecycle metrics and combines safe diagnostics from owning modules. @layer service @owner order */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    config: function () { return (((CONFIG.get('order') || {}).orderLifecycle || {}).operations) || {}; },
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00068'; return error; },
    items: function (value) { return value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : []; },
    authorize: function (request) { let auth = request.authData || {}; if (!request.tenant || !['access', 'service'].includes(auth.tokenType)) throw this.error('Lifecycle diagnostics requires authenticated operations identity'); let enterpriseCode = request.enterpriseCode || request.entCode || auth.entCode || auth.enterpriseCode; if (!enterpriseCode) throw this.error('Lifecycle diagnostics requires enterprise scope'); return enterpriseCode; },
    ownerDiagnostics: async function (request, enterpriseCode) {
        let output = { metrics: {}, findings: [], correlations: {} };
        for (let descriptor of [].concat(this.config().ownerContributors || [])) {
            let service = SERVICE[descriptor.service];
            if (!service || typeof service[descriptor.operation] !== 'function') throw this.error('Lifecycle owner diagnostics authority is unavailable: ' + descriptor.owner);
            let result = await service[descriptor.operation]({ tenant: request.tenant, authData: request.authData, enterpriseCode: enterpriseCode, now: request.now });
            output.metrics[descriptor.owner] = result.metrics || {}; output.findings.push(...[].concat(result.findings || [])); output.correlations[descriptor.owner] = result.correlations || {};
        }
        return output;
    },
    scan: async function (request) {
        let entCode = this.authorize(request), config = this.config(), limit = Number(config.maximumScanRecords || 500);
        let response = await SERVICE.DefaultOrderLifecycleRequestService.get({ tenant: request.tenant, authData: request.authData, query: { entCode }, searchOptions: { limit: limit + 1, sort: { updatedAt: -1 } } });
        let records = this.items(response); if (records.length > limit) throw this.error('Lifecycle diagnostics exceeds configured scan bounds');
        let now = request.now ? new Date(request.now) : new Date(), sla = config.slaMinutesByState || {}, findings = [];
        records.forEach(item => { let timestamp = new Date(item.updatedAt || item.submittedAt || item.createdAt || 0), minutes = Number.isFinite(timestamp.getTime()) ? Math.floor((now.getTime() - timestamp.getTime()) / 60000) : Number.MAX_SAFE_INTEGER, threshold = Number(sla[item.state] || 0); if (item.state === 'RECONCILIATION_REQUIRED') findings.push({ severity: 'HIGH', findingCode: 'OWNER_RECONCILIATION_REQUIRED', requestCode: item.requestCode, requestType: item.requestType, state: item.state, ageMinutes: minutes, owner: item.requestType === 'REFUND' ? 'payment' : 'order-workflow', nextActions: item.requestType === 'REFUND' ? ['RECONCILE_PROVIDER_REFUND', 'RETRY_REFUND'] : ['REVIEW_OWNER_CHECKPOINTS'] }); else if (item.requestType === 'RETURN' && item.state === 'AUTHORIZED' && minutes > Number(sla.AUTHORIZED || 10080)) findings.push({ severity: 'HIGH', findingCode: 'UNRECEIVED_RETURN', requestCode: item.requestCode, requestType: item.requestType, state: item.state, ageMinutes: minutes, owner: 'fulfillment', nextActions: ['REVIEW_RETURN_TRACKING'] }); else if (threshold > 0 && minutes > threshold && !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(item.state)) findings.push({ severity: 'MEDIUM', findingCode: 'LIFECYCLE_SLA_EXCEEDED', requestCode: item.requestCode, requestType: item.requestType, state: item.state, ageMinutes: minutes, owner: ['APPROVAL_PENDING', 'AUTHORIZATION_PENDING', 'ESCALATED'].includes(item.state) ? 'workflow' : 'order', nextActions: ['REVIEW_WORKFLOW_STATE'] }); });
        let byType = {}, byState = {}, reasons = {}; records.forEach(item => { byType[item.requestType] = Number(byType[item.requestType] || 0) + 1; byState[item.state] = Number(byState[item.state] || 0) + 1; if (item.reasonCode) reasons[item.reasonCode] = Number(reasons[item.reasonCode] || 0) + 1; });
        let owner = await this.ownerDiagnostics(request, entCode); findings.push(...owner.findings);
        return { enterpriseCode: entCode, observedAt: now, metrics: { requestVolumeByType: byType, workloadByState: byState, reasonVolume: reasons, reconciliationCount: findings.filter(value => value.findingCode === 'OWNER_RECONCILIATION_REQUIRED').length, slaBreachCount: findings.filter(value => value.findingCode === 'LIFECYCLE_SLA_EXCEEDED').length, owner: owner.metrics }, correlations: owner.correlations, findings };
    },
    run: async function (request) { request = request || {}; if (!request.authData) request.authData = { tokenType: 'service', principalId: 'order-lifecycle-reconciliation' }; if (!request.tenant) request.tenant = request.body && request.body.tenant || 'default'; request.enterpriseCode = request.enterpriseCode || request.body && request.body.enterpriseCode; return this.scan(request); },
};
