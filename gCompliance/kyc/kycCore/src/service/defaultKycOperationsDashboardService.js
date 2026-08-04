/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module kycCore/service/DefaultKycOperationsDashboardService @description Builds a bounded, permissioned operational projection for Axis Compliance Management. @layer service @owner kycCore @override Customers may replace metrics and thresholds while preserving scope, bounds, masking, and backend authority. */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    rows: value => value && Array.isArray(value.result) ? value.result : [],
    /**
     * Summarizes the module artifact within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    summarize: async function (request) {
        if (!((request.authData || {}).permissions || []).includes('compliance.management.read')) { const error = new Error('Compliance dashboard is not authorized.'); error.code = 'KYC_OPERATION_FORBIDDEN'; throw error; }
        const scope = { tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode }; const searchOptions = { limit: Number((CONFIG.get('kyc.operations') || {}).dashboardMaximumRecords || 500) };
        const [cases, tasks, providers, attempts] = await Promise.all([
            SERVICE.DefaultKycVerificationCaseService.get({ tenant: request.tenant, authData: request.authData, query: scope, searchOptions }, {}),
            SERVICE.DefaultKycReviewTaskService.get({ tenant: request.tenant, authData: request.authData, query: scope, searchOptions }, {}),
            SERVICE.DefaultKycProviderService.get({ tenant: request.tenant, authData: request.authData, query: scope, searchOptions }, {}),
            SERVICE.DefaultKycProviderExecutionAttemptService.get({ tenant: request.tenant, authData: request.authData, query: scope, searchOptions }, {})
        ]);
        const count = (values, field) => values.reduce((result, value) => { const key = String(value[field] || 'UNKNOWN'); result[key] = (result[key] || 0) + 1; return result; }, {});
        const taskRows = this.rows(tasks); const now = Date.now();
        return { generatedAt: new Date(), bounded: [cases, tasks, providers, attempts].some(value => this.rows(value).length >= searchOptions.limit), cases: count(this.rows(cases), 'status'), reviews: count(taskRows, 'status'), sla: { overdue: taskRows.filter(task => task.dueAt && new Date(task.dueAt).getTime() < now && !['COMPLETED', 'CLOSED'].includes(task.status)).length }, providers: this.rows(providers).map(provider => ({ providerCode: provider.providerCode, healthStatus: provider.healthStatus, productionReady: provider.productionReady === true, status: provider.status })), executionAttempts: count(this.rows(attempts), 'status') };
    }
};
