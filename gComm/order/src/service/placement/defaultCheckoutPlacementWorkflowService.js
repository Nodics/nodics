/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/service/placement/DefaultCheckoutPlacementWorkflowService
 * @description Bridges checkout placement commands into Workflow carriers and
 * executes checkout placement as business-level Workflow actions. nPipeline is
 * used only inside atomic technical actions such as placement-run evidence.
 * @layer service
 * @owner order
 * @override Project modules may replace workflow selection, manual approval
 * policy, carrier item mapping, or individual business action handlers through
 * layered configuration and service overrides while preserving Order as the
 * placement authority.
 */
module.exports = {
    /** Initializes checkout placement workflow bridge. */
    init: function () { return Promise.resolve(true); },
    /** Completes checkout placement workflow bridge startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered checkout placement configuration. */
    config: function () { return ((CONFIG.get('order') || {}).checkoutPlacement) || {}; },
    /** Creates a stable checkout placement error. */
    error: function (message, code) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00021');
        let error = new Error(message);
        error.code = code || 'ERR_ORD_00021';
        return error;
    },
    /** Resolves manual or automatic placement mode from configuration and request. */
    mode: function (value) {
        let workflow = this.config().workflow || {};
        let mode = value || workflow.defaultMode || 'AUTOMATIC';
        if (!(workflow.modes || ['MANUAL', 'AUTOMATIC']).includes(mode)) {
            throw this.error('Checkout placement workflow mode is unsupported');
        }
        return mode;
    },
    /** Submits a cart placement request into Workflow instead of directly running business steps. */
    submit: async function (request) {
        let config = this.config();
        let workflow = config.workflow || {};
        let body = request.body || request.checkoutPlacement || {};
        if (config.enabled === false || workflow.enabled === false || !SERVICE.DefaultWorkflowService) {
            throw this.error('Checkout placement Workflow is unavailable');
        }
        if (!request.tenant || !request.authData || !body.cartCode || !body.entCode) {
            throw this.error('Checkout placement submission requires tenant, auth, cartCode, and entCode');
        }
        let mode = this.mode(body.approvalMode);
        let workflowCode = mode === 'MANUAL' ? workflow.manualWorkflowCode : workflow.automaticWorkflowCode;
        let idempotencyKey = body.idempotencyKey || (body.entCode + '::checkoutPlacement::' + body.cartCode);
        let carrierCode = body.carrierCode || idempotencyKey;
        if (SERVICE.DefaultWorkflowCarrierService &&
            await SERVICE.DefaultWorkflowCarrierService.isCarrierAvailable({ tenant: request.tenant, authData: request.authData, carrierCode: carrierCode })) {
            return { carrierCode: carrierCode, workflowCode: workflowCode, approvalMode: mode, idempotent: true };
        }
        await SERVICE.DefaultWorkflowService.initCarrier({
            tenant: request.tenant,
            authData: request.authData,
            workflowCode: workflowCode,
            releaseCarrier: true,
            carrier: {
                code: carrierCode,
                event: { enabled: true },
                sourceDetail: {
                    enterpriseCode: body.entCode,
                    entCode: body.entCode,
                    cartCode: body.cartCode,
                    idempotencyKey: idempotencyKey,
                    approvalMode: mode,
                    processType: 'checkoutPlacement'
                },
                items: [{
                    active: true,
                    schemaName: 'cart',
                    code: body.cartCode,
                    refId: body.cartCode,
                    itemDetail: {
                        schemaName: 'cart',
                        code: body.cartCode
                    }
                }]
            }
        });
        return { carrierCode: carrierCode, workflowCode: workflowCode, approvalMode: mode, state: 'SUBMITTED', idempotent: false };
    },
    /** Resolves and validates Workflow carrier source details for placement actions. */
    source: function (request) {
        let carrier = request.workflowCarrier || {};
        let source = carrier.sourceDetail || {};
        if (!carrier.code || !source.cartCode || !(source.enterpriseCode || source.entCode)) {
            throw this.error('Checkout placement Workflow carrier is incomplete');
        }
        return { carrier, source };
    },
    /** Resolves accumulated checkout placement evidence from request, carrier source, or prior action feedback. */
    evidence: function (request, carrier, source) {
        let projection = request.orderProjection && (request.orderProjection.order || request.orderProjection.result || request.orderProjection);
        let placementRun = request.placementRun || {};
        let prior = request.feedback || request.previousFeedback || request.workflowFeedback || {};
        let allocationCopy = request.allocationCopy || prior.allocationCopy;
        let paymentAuthorization = request.paymentAuthorization || prior.paymentAuthorization;
        let fulfillmentRelease = request.fulfillmentRelease || prior.fulfillmentRelease;
        let inventoryReservations = request.inventoryReservations || prior.inventoryReservations;
        let orderCode = request.orderCode || source.orderCode || (projection && projection.code) || prior.orderCode || (allocationCopy && allocationCopy.orderCode);
        let placementCode = request.placementCode || source.placementCode || placementRun.placementCode || prior.placementCode || source.idempotencyKey || carrier.code;
        let idempotencyKey = request.idempotencyKey || source.idempotencyKey || placementRun.idempotencyKey || carrier.code;
        return {
            cartCode: request.cartCode || source.cartCode,
            entCode: request.entCode || source.enterpriseCode || source.entCode,
            orderCode: orderCode,
            placementCode: placementCode,
            idempotencyKey: idempotencyKey,
            workflowCarrierCode: carrier.code,
            orderProjection: request.orderProjection || prior.orderProjection,
            allocationCopy: allocationCopy,
            paymentAuthorization: paymentAuthorization,
            fulfillmentRelease: fulfillmentRelease,
            inventoryReservations: inventoryReservations,
            validation: request.validation || prior.validation,
        };
    },
    /** Builds safe placement completion evidence for history and placement-run finalization. */
    completionEvidence: function (evidence) {
        let allocationCopy = evidence.allocationCopy || {};
        let inventoryReservations = evidence.inventoryReservations || {};
        let paymentAuthorization = evidence.paymentAuthorization || {};
        let fulfillmentRelease = evidence.fulfillmentRelease || {};
        return {
            cartCode: evidence.cartCode,
            orderCode: evidence.orderCode,
            placementCode: evidence.placementCode,
            workflowCarrierCode: evidence.workflowCarrierCode,
            inventoryReservationCount: Number(inventoryReservations.count || (inventoryReservations.reservations || []).length || 0),
            deliveryGroupCount: (allocationCopy.deliveryGroups || []).length,
            paymentGroupCount: (allocationCopy.paymentGroups || []).length,
            deliveryAllocationCount: (allocationCopy.deliveryAllocations || []).length,
            paymentAllocationCount: (allocationCopy.paymentAllocations || []).length,
            paymentAuthorizationCount: Number(paymentAuthorization.count || 0),
            paymentAuthorizedCount: (paymentAuthorization.authorized || []).length,
            paymentDeferredCount: (paymentAuthorization.deferred || []).length,
            fulfillmentReleaseCount: Number(fulfillmentRelease.count || (fulfillmentRelease.consignments || []).length || 0),
        };
    },
    /** Resolves actor evidence for order history. */
    actor: function (authData) {
        return {
            actorType: authData && authData.tokenType === 'service' ? 'SERVICE' : 'EMPLOYEE',
            actorCode: authData && (authData.principalId || authData.code || authData.username),
        };
    },
    /** Builds the standard success decision for a checkout placement Workflow action. */
    success: function (name, feedback) {
        return {
            decision: 'SUCCESS',
            type: 'SUCCESS',
            feedback: Object.assign({ action: name }, feedback || {})
        };
    },
    /** Starts order-owned placement-run evidence. This is one technical task, so it may use nPipeline internally. */
    startPlacementRun: async function (request) {
        let { carrier, source } = this.source(request);
        let pipelineName = ((this.config().pipeline || {}).name) || 'checkoutPlacementRunPipeline';
        let result = await SERVICE.DefaultPipelineService.start(pipelineName, Object.assign({}, request, {
            workflowCarrier: carrier,
            cartCode: source.cartCode,
            entCode: source.enterpriseCode || source.entCode,
            idempotencyKey: source.idempotencyKey || carrier.code
        }), {});
        return this.success('startPlacementRun', {
            cartCode: source.cartCode,
            placementCode: result && result.placementRun && result.placementRun.placementCode,
            workflowCarrierCode: carrier.code,
            pipelineName: pipelineName
        });
    },
    /** Validates cart aggregate, security context, delivery splits, payment splits, and quantity allocation policy. */
    validatePlacement: async function (request) {
        let { carrier, source } = this.source(request);
        let validation = null;
        if (SERVICE.DefaultOrderCheckoutPlacementValidationService &&
            typeof SERVICE.DefaultOrderCheckoutPlacementValidationService.validate === 'function') {
            validation = await SERVICE.DefaultOrderCheckoutPlacementValidationService.validate(Object.assign({}, request, {
                workflowCarrier: carrier,
                cartCode: source.cartCode,
                entCode: source.enterpriseCode || source.entCode
            }));
        }
        return this.success('validatePlacement', { cartCode: source.cartCode, workflowCarrierCode: carrier.code, validation: validation });
    },
    /** Reserves stock, preorder, backorder, or allowed-overbooking promises through Inventory-owned services. */
    reserveInventory: async function (request) {
        let { carrier, source } = this.source(request);
        let inventoryReservations = null;
        if (SERVICE.DefaultCheckoutInventoryReservationService &&
            typeof SERVICE.DefaultCheckoutInventoryReservationService.reserve === 'function') {
            inventoryReservations = await SERVICE.DefaultCheckoutInventoryReservationService.reserve(Object.assign({}, request, {
                workflowCarrier: carrier,
                cartCode: source.cartCode,
                entCode: source.enterpriseCode || source.entCode
            }));
        }
        return this.success('reserveInventory', { cartCode: source.cartCode, workflowCarrierCode: carrier.code, inventoryReservations: inventoryReservations });
    },
    /** Creates Order-owned header and entry projection from the validated Cart aggregate. */
    createOrderProjection: async function (request) {
        let { carrier, source } = this.source(request);
        let projection = null;
        if (SERVICE.DefaultCheckoutOrderProjectionService &&
            typeof SERVICE.DefaultCheckoutOrderProjectionService.create === 'function') {
            projection = await SERVICE.DefaultCheckoutOrderProjectionService.create(Object.assign({}, request, {
                workflowCarrier: carrier,
                cartCode: source.cartCode,
                entCode: source.enterpriseCode || source.entCode,
                idempotencyKey: source.idempotencyKey || carrier.code
            }));
        }
        let order = projection && (projection.order || projection.result || projection);
        return this.success('createOrderProjection', {
            cartCode: source.cartCode,
            orderCode: order && order.code,
            workflowCarrierCode: carrier.code,
            orderProjection: projection
        });
    },
    /** Copies checkout delivery/payment allocation models from cart scope to order scope. */
    copyAllocations: async function (request) {
        let { carrier, source } = this.source(request);
        let allocationCopy = null;
        if (SERVICE.DefaultCheckoutAllocationCopyService &&
            typeof SERVICE.DefaultCheckoutAllocationCopyService.copy === 'function') {
            allocationCopy = await SERVICE.DefaultCheckoutAllocationCopyService.copy(Object.assign({}, request, {
                workflowCarrier: carrier,
                cartCode: source.cartCode,
                entCode: source.enterpriseCode || source.entCode,
                idempotencyKey: source.idempotencyKey || carrier.code
            }));
        }
        return this.success('copyAllocations', { cartCode: source.cartCode, workflowCarrierCode: carrier.code, allocationCopy: allocationCopy });
    },
    /** Authorizes or defers order payment groups through the Payment-owned capability. */
    authorizePayment: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if (!evidence.orderCode) throw this.error('Checkout placement payment authorization requires produced orderCode', 'ERR_ORD_00029');
        if (!SERVICE.DefaultPaymentCheckoutAuthorizationService ||
            typeof SERVICE.DefaultPaymentCheckoutAuthorizationService.authorize !== 'function') {
            throw this.error('Payment checkout authorization service is unavailable', 'ERR_ORD_00029');
        }
        let paymentAuthorization = await SERVICE.DefaultPaymentCheckoutAuthorizationService.authorize(Object.assign({}, request, {
            workflowCarrier: carrier,
            cartCode: evidence.cartCode,
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            idempotencyKey: evidence.idempotencyKey,
            allocationCopy: evidence.allocationCopy
        }));
        return this.success('authorizePayment', {
            cartCode: evidence.cartCode,
            orderCode: evidence.orderCode,
            placementCode: evidence.placementCode,
            workflowCarrierCode: carrier.code,
            paymentAuthorization: paymentAuthorization
        });
    },
    /** Releases order delivery groups to the Fulfillment-owned capability. */
    releaseFulfillment: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if (!evidence.orderCode) throw this.error('Checkout placement fulfillment release requires produced orderCode', 'ERR_ORD_00030');
        if (!SERVICE.DefaultFulfillmentReleaseService ||
            typeof SERVICE.DefaultFulfillmentReleaseService.release !== 'function') {
            throw this.error('Fulfillment release service is unavailable', 'ERR_ORD_00030');
        }
        let fulfillmentRelease = await SERVICE.DefaultFulfillmentReleaseService.release(Object.assign({}, request, {
            workflowCarrier: carrier,
            cartCode: evidence.cartCode,
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            idempotencyKey: evidence.idempotencyKey,
            allocationCopy: evidence.allocationCopy,
            paymentAuthorization: evidence.paymentAuthorization
        }));
        return this.success('releaseFulfillment', {
            cartCode: evidence.cartCode,
            orderCode: evidence.orderCode,
            placementCode: evidence.placementCode,
            workflowCarrierCode: carrier.code,
            fulfillmentRelease: fulfillmentRelease
        });
    },
    /** Records Order lifecycle history after projection and allocation copy complete. */
    recordHistory: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if (!evidence.orderCode) throw this.error('Checkout placement history requires produced orderCode', 'ERR_ORD_00026');
        if (!SERVICE.DefaultOrderHistoryEntryService || typeof SERVICE.DefaultOrderHistoryEntryService.save !== 'function') {
            throw this.error('Order History generated service is unavailable', 'ERR_ORD_00026');
        }
        let actor = this.actor(request.authData);
        let model = {
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            historyCode: evidence.idempotencyKey + ':placement',
            eventType: 'CHECKOUT_PLACEMENT',
            statusTo: 'PLACED',
            actorType: actor.actorType,
            actorCode: actor.actorCode,
            sourceModule: 'order',
            sourceOperation: 'checkoutPlacementWorkflow.recordHistory',
            evidenceCode: evidence.placementCode,
            message: 'Checkout placement business workflow completed'
        };
        let saved = await SERVICE.DefaultOrderHistoryEntryService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: model
        });
        return this.success('recordHistory', {
            cartCode: evidence.cartCode,
            orderCode: evidence.orderCode,
            placementCode: evidence.placementCode,
            workflowCarrierCode: carrier.code,
            historyEntry: saved && (saved.result && saved.result[0] || saved)
        });
    },
    /** Completes the business Workflow after all placement actions are successful. */
    completePlacement: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if (!evidence.orderCode) throw this.error('Checkout placement completion requires produced orderCode', 'ERR_ORD_00027');
        let completionEvidence = this.completionEvidence(evidence);
        let placementRun = {
            entCode: evidence.entCode,
            placementCode: evidence.placementCode,
            cartCode: evidence.cartCode,
            orderCode: evidence.orderCode,
            workflowCarrierCode: carrier.code,
            pipelineName: ((this.config().pipeline || {}).name) || 'checkoutPlacementRunPipeline',
            idempotencyKey: evidence.idempotencyKey,
            state: 'COMPLETED',
            currentStep: 'completePlacement',
            evidence: completionEvidence
        };
        if (SERVICE.DefaultCheckoutPlacementRunService && typeof SERVICE.DefaultCheckoutPlacementRunService.save === 'function') {
            await SERVICE.DefaultCheckoutPlacementRunService.save({
                tenant: request.tenant,
                authData: request.authData,
                model: placementRun
            });
        }
        return this.success('completePlacement', {
            cartCode: evidence.cartCode,
            orderCode: evidence.orderCode,
            placementCode: evidence.placementCode,
            workflowCarrierCode: carrier.code,
            placementRun: placementRun,
            completionEvidence: completionEvidence
        });
    },
    /** Compensates a failed checkout placement by delegating rollback/release to owning modules and recording safe failure evidence. */
    compensatePlacement: async function (request) {
        let { carrier, source } = this.source(request);
        if (!SERVICE.DefaultCheckoutPlacementCompensationService ||
            typeof SERVICE.DefaultCheckoutPlacementCompensationService.compensate !== 'function') {
            throw this.error('Checkout placement compensation service is unavailable', 'ERR_ORD_00028');
        }
        let compensation = await SERVICE.DefaultCheckoutPlacementCompensationService.compensate(Object.assign({}, request, {
            workflowCarrier: carrier,
            cartCode: request.cartCode || source.cartCode,
            entCode: request.entCode || source.enterpriseCode || source.entCode,
            idempotencyKey: request.idempotencyKey || source.idempotencyKey || carrier.code
        }));
        return this.success('compensatePlacement', {
            cartCode: compensation.cartCode,
            orderCode: compensation.orderCode,
            placementCode: compensation.placementCode,
            workflowCarrierCode: carrier.code,
            compensation: compensation
        });
    }
};
