/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/placement/DefaultCheckoutPlacementPipelineService
 * @description Pipeline node service for the atomic checkout placement-run
 * evidence task. Workflow owns the business process; this pipeline only divides
 * one technical unit into validation, run evidence initialization, and response
 * finalization steps.
 * @layer service
 * @owner order
 * @override Project modules may replace individual node handlers or override
 * `checkoutPlacementRunPipeline` while preserving workflow carrier evidence and
 * order-owned placement run state.
 */
module.exports = {
    /** Initializes checkout placement pipeline handlers. */
    init: function () { return Promise.resolve(true); },
    /** Completes checkout placement pipeline handler startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered checkout placement configuration. */
    config: function () { return ((CONFIG.get('order') || {}).checkoutPlacement) || {}; },
    /** Creates a stable placement error. */
    error: function (message, code) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00020');
        let error = new Error(message);
        error.code = code || 'ERR_ORD_00020';
        return error;
    },
    /** Ensures the pipeline has a mutable success envelope. */
    envelope: function (request, response) {
        response.success = response.success || {
            placementRun: request.placementRun || null,
            steps: [],
            evidence: {}
        };
        response.success.evidence = response.success.evidence || {};
        response.success.steps = response.success.steps || [];
        return response.success;
    },
    /** Records a safe step marker for observability and tests. */
    mark: function (request, response, step, state) {
        let envelope = this.envelope(request, response);
        envelope.steps.push(step);
        if (request.placementRun) {
            request.placementRun.currentStep = step;
            if (state) request.placementRun.state = state;
            envelope.placementRun = request.placementRun;
        }
    },
    /** Validates minimum placement request context. */
    validateRequest: function (request, response, process) {
        if (!request || !request.tenant || !request.authData) {
            process.error(request, response, this.error('Checkout placement requires tenant and auth context'));
            return;
        }
        let carrier = request.workflowCarrier || {};
        let source = carrier.sourceDetail || {};
        request.cartCode = request.cartCode || source.cartCode;
        request.entCode = request.entCode || source.enterpriseCode || source.entCode;
        request.idempotencyKey = request.idempotencyKey || source.idempotencyKey || carrier.code;
        if (!request.cartCode || !request.entCode || !request.idempotencyKey) {
            process.error(request, response, this.error('Checkout placement requires cartCode, entCode, and idempotencyKey'));
            return;
        }
        this.mark(request, response, 'validateRequest', 'RUNNING');
        process.nextSuccess(request, response);
    },
    /** Starts or resumes the order-owned placement evidence run. */
    startPlacementRun: function (request, response, process) {
        let pipelineName = (this.config().pipeline || {}).name || 'checkoutPlacementRunPipeline';
        request.placementRun = request.placementRun || {
            entCode: request.entCode,
            placementCode: request.placementCode || request.idempotencyKey,
            cartCode: request.cartCode,
            workflowCarrierCode: request.workflowCarrier && request.workflowCarrier.code,
            pipelineName: pipelineName,
            idempotencyKey: request.idempotencyKey,
            state: 'INIT',
            evidence: {}
        };
        this.mark(request, response, 'startPlacementRun', 'RUNNING');
        process.nextSuccess(request, response);
    },
    /** Finalizes order-owned placement run evidence. */
    finalizePlacementRun: function (request, response, process) {
        let envelope = this.envelope(request, response);
        if (request.placementRun) {
            request.placementRun.state = 'COMPLETED';
            request.placementRun.currentStep = 'finalizePlacementRun';
            request.placementRun.evidence = Object.assign({}, request.placementRun.evidence || {}, envelope.evidence);
            envelope.placementRun = request.placementRun;
        }
        envelope.orderCode = request.orderCode;
        envelope.workflowCarrierCode = request.workflowCarrier && request.workflowCarrier.code;
        envelope.steps.push('finalizePlacementRun');
        process.nextSuccess(request, response);
    },
    /** Resolves checkout placement pipeline execution. */
    handleSucessEnd: function (request, response, process) {
        process.resolve(response.success);
    },
    /** Marks placement evidence failed and rejects the pipeline. */
    handleErrorEnd: function (request, response, process) {
        if (request && request.placementRun) {
            request.placementRun.state = 'FAILED';
            request.placementRun.failureCode = response.error && response.error.code;
            request.placementRun.failureMessage = response.error && response.error.message;
        }
        process.reject(response.error);
    }
};
