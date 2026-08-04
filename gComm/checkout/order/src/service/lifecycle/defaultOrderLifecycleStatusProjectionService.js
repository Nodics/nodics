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
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Completes initialization for the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the config operation within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return ((((CONFIG.get('order') || {}).orderLifecycle || {}).statusProjection) || {}); },
    /**
     * Executes the project item operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} item Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    projectItem: function (request, item) {
        let state = request.state, evidence = request.evidence || {}, approvedStates = this.config().approvedStates || ['APPROVED', 'AUTHORIZED', 'EXECUTING', 'COMPLETED', 'RECONCILIATION_REQUIRED'];
        let approved = approvedStates.includes(state) || ['APPROVED', 'AUTHORIZED'].includes(evidence.approvalDecision) || evidence.authorizationDecision === 'AUTHORIZED';
        let rejected = state === 'REJECTED' || evidence.approvalDecision === 'REJECTED' || evidence.authorizationDecision === 'REJECTED';
        let approvedQuantity = approved ? item.approvedQuantity || item.requestedQuantity : '0';
        let rejectedQuantity = rejected ? item.rejectedQuantity || item.requestedQuantity : '0';
        return { orderEntryCode: item.orderEntryCode, requestedQuantity: item.requestedQuantity, approvedQuantity: approvedQuantity, rejectedQuantity: rejectedQuantity, unitCode: item.unitCode, serialNumbers: item.serialNumbers || [] };
    },
    /**
     * Executes the timeline operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    timeline: function (request) {
        let minutes = Number((this.config().expectedActionMinutesByState || {})[request.state] || 0), updated = new Date(request.updatedAt || request.submittedAt || request.createdAt || 0);
        return { state: request.state, lastUpdatedAt: Number.isFinite(updated.getTime()) ? updated : undefined, expectedActionMinutes: minutes || undefined, expectedActionAt: minutes > 0 && Number.isFinite(updated.getTime()) ? new Date(updated.getTime() + minutes * 60000) : undefined };
    },
    /**
     * Executes the project operation within the order-owned layered contract.
     *
     * @param {*} aggregate Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    project: function (aggregate) {
        let request = aggregate.request || {}, items = [].concat(aggregate.items || []);
        return Object.assign({}, aggregate, { statusProjection: { requestCode: request.requestCode, requestType: request.requestType, state: request.state, quantities: items.map(item => this.projectItem(request, item)), timeline: this.timeline(request) } });
    },
};
