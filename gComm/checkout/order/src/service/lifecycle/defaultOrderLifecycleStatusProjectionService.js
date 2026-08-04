/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/service/lifecycle/DefaultOrderLifecycleStatusProjectionService @description Builds safe customer/support quantity and timeline projections from authoritative lifecycle state. @layer service @owner order */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    config: function () { return ((((CONFIG.get('order') || {}).orderLifecycle || {}).statusProjection) || {}); },
    projectItem: function (request, item) {
        let state = request.state, evidence = request.evidence || {}, approvedStates = this.config().approvedStates || ['APPROVED', 'AUTHORIZED', 'EXECUTING', 'COMPLETED', 'RECONCILIATION_REQUIRED'];
        let approved = approvedStates.includes(state) || ['APPROVED', 'AUTHORIZED'].includes(evidence.approvalDecision) || evidence.authorizationDecision === 'AUTHORIZED';
        let rejected = state === 'REJECTED' || evidence.approvalDecision === 'REJECTED' || evidence.authorizationDecision === 'REJECTED';
        let approvedQuantity = approved ? item.approvedQuantity || item.requestedQuantity : '0';
        let rejectedQuantity = rejected ? item.rejectedQuantity || item.requestedQuantity : '0';
        return { orderEntryCode: item.orderEntryCode, requestedQuantity: item.requestedQuantity, approvedQuantity: approvedQuantity, rejectedQuantity: rejectedQuantity, unitCode: item.unitCode, serialNumbers: item.serialNumbers || [] };
    },
    timeline: function (request) {
        let minutes = Number((this.config().expectedActionMinutesByState || {})[request.state] || 0), updated = new Date(request.updatedAt || request.submittedAt || request.createdAt || 0);
        return { state: request.state, lastUpdatedAt: Number.isFinite(updated.getTime()) ? updated : undefined, expectedActionMinutes: minutes || undefined, expectedActionAt: minutes > 0 && Number.isFinite(updated.getTime()) ? new Date(updated.getTime() + minutes * 60000) : undefined };
    },
    project: function (aggregate) {
        let request = aggregate.request || {}, items = [].concat(aggregate.items || []);
        return Object.assign({}, aggregate, { statusProjection: { requestCode: request.requestCode, requestType: request.requestType, state: request.state, quantities: items.map(item => this.projectItem(request, item)), timeline: this.timeline(request) } });
    },
};
