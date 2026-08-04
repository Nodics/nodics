/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module kycCore/service/DefaultKycWorkflowContinuationService @description Validates KYC carrier ownership and continues Workflow idempotently with bounded decision evidence. @layer service @owner kycCore @override Later modules may replace carrier mapping while preserving Workflow ownership, case consistency, and idempotency. */
const fail = (message, code) => Object.assign(new Error(message), { code });
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes the continue operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} projection Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    continue: async function (request, projection) {
        const carrierCode = projection.caseModel.workflowCode;
        if (!carrierCode || !SERVICE.DefaultWorkflowCarrierService || !SERVICE.DefaultWorkflowService) throw fail('KYC Workflow continuation is unavailable.', 'KYC_PROVIDER_UNAVAILABLE');
        const loaded = await SERVICE.DefaultWorkflowCarrierService.getByCode({ tenant: request.tenant, authData: request.authData, code: carrierCode });
        const carrier = loaded && (loaded.result || loaded);
        const source = carrier && (carrier.sourceDetail || carrier.item && carrier.item.sourceDetail) || {};
        const representedCaseCode = source.caseCode || carrier && carrier.item && carrier.item.caseCode || carrier && carrier.code;
        if (!carrier || representedCaseCode !== projection.caseModel.caseCode) throw fail('Workflow carrier does not represent the scoped KYC case.', 'KYC_STATE_CONFLICT');
        const previous = carrier.activeAction && carrier.activeAction.actionResponse || carrier.currentState && carrier.currentState.actionResponse;
        if (previous && previous.feedback && previous.feedback.decisionCode === projection.decision.decisionCode) return { idempotent: true, carrierCode };
        const result = await SERVICE.DefaultWorkflowService.performAction({ tenant: request.tenant, authData: request.authData, carrierCode, actionResponse: { decision: projection.outcome, feedback: { caseCode: projection.caseModel.caseCode, decisionCode: projection.decision.decisionCode, checkCode: projection.check && projection.check.checkCode } } });
        return { idempotent: false, carrierCode, result };
    }
};
