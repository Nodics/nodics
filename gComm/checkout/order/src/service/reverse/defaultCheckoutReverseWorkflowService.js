/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/reverse/DefaultCheckoutReverseWorkflowService
 * @description Coordinates return and refund business Workflow actions while keeping Fulfillment and Payment authoritative for their own evidence.
 * @layer service
 * @owner order
 * @override Project modules may replace reverse workflow selection, approval, refund calculation, notification, or compensation handlers while preserving owner-delegated Fulfillment and Payment boundaries.
 */
module.exports = {
    /** Initializes checkout reverse workflow bridge. */
    init: function () { return Promise.resolve(true); },
    /** Completes checkout reverse workflow bridge startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered checkout reverse configuration. */
    config: function () { return ((CONFIG.get('order') || {}).checkoutReverse) || {}; },
    /** Creates a stable checkout reverse error. */
    error: function (message, code) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00031');
        let error = new Error(message);
        error.code = code || 'ERR_ORD_00031';
        return error;
    },
    /** Resolves manual or automatic reverse workflow mode. */
    mode: function (value) {
        let workflow = this.config().workflow || {};
        let mode = value || workflow.defaultMode || 'MANUAL';
        if (!(workflow.modes || ['MANUAL', 'AUTOMATIC']).includes(mode)) {
            throw this.error('Checkout reverse workflow mode is unsupported');
        }
        return mode;
    },
    /** Rejects unsafe request payloads before they reach owner services. */
    assertSafe: function (value) {
        if (JSON.stringify(value || {}).match(/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload|rawCarrier|carrierPayload|rawLabel/i)) {
            throw this.error('Checkout reverse request must not contain credentials, card data, labels, or raw provider payloads');
        }
    },
    /** Submits an order reverse request into Workflow instead of directly running business steps. */
    submit: async function (request) {
        let config = this.config();
        let workflow = config.workflow || {};
        let body = request.body || request.checkoutReverse || {};
        this.assertSafe(body);
        if (config.enabled === false || workflow.enabled === false || !SERVICE.DefaultWorkflowService) {
            throw this.error('Checkout reverse Workflow is unavailable');
        }
        if (!request.tenant || !request.authData || !body.orderCode || !body.entCode) {
            throw this.error('Checkout reverse submission requires tenant, auth, orderCode, and entCode');
        }
        let mode = this.mode(body.approvalMode);
        let workflowCode = mode === 'MANUAL' ? workflow.manualWorkflowCode : workflow.automaticWorkflowCode;
        let idempotencyKey = body.idempotencyKey || (body.entCode + '::checkoutReverse::' + body.orderCode + '::' + (body.returnReasonCode || 'return'));
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
                sourceDetail: Object.assign({}, body, {
                    enterpriseCode: body.entCode,
                    idempotencyKey: idempotencyKey,
                    approvalMode: mode,
                    processType: 'checkoutReverse'
                }),
                items: [{
                    active: true,
                    schemaName: 'order',
                    code: body.orderCode,
                    refId: body.orderCode,
                    itemDetail: {
                        schemaName: 'order',
                        code: body.orderCode
                    }
                }]
            }
        });
        return { carrierCode: carrierCode, workflowCode: workflowCode, approvalMode: mode, state: 'SUBMITTED', idempotent: false };
    },
    /** Resolves and validates Workflow carrier source details for reverse actions. */
    source: function (request) {
        let carrier = request.workflowCarrier || {};
        let source = carrier.sourceDetail || {};
        if (!carrier.code || !source.orderCode || !(source.enterpriseCode || source.entCode)) {
            throw this.error('Checkout reverse Workflow carrier is incomplete');
        }
        this.assertSafe(source);
        return { carrier, source };
    },
    /** Resolves accumulated reverse evidence from request, carrier source, or prior action feedback. */
    evidence: function (request, carrier, source) {
        let prior = request.feedback || request.previousFeedback || request.workflowFeedback || {};
        let returnRequest = request.returnRequest || prior.returnRequest;
        let refundCalculation = request.refundCalculation || prior.refundCalculation;
        let refundTransaction = request.refundTransaction || prior.refundTransaction;
        let reverseRun = request.reverseRun || {};
        let returnCode = request.returnCode || source.returnCode || (returnRequest && returnRequest.returnCode) || prior.returnCode;
        let refundTransactionCode = request.refundTransactionCode || source.refundTransactionCode ||
            (refundTransaction && refundTransaction.transactionCode) || prior.refundTransactionCode;
        let idempotencyKey = request.idempotencyKey || source.idempotencyKey || reverseRun.idempotencyKey || carrier.code;
        return {
            entCode: request.entCode || source.enterpriseCode || source.entCode,
            orderCode: request.orderCode || source.orderCode,
            reverseCode: request.reverseCode || source.reverseCode || reverseRun.reverseCode || idempotencyKey,
            idempotencyKey: idempotencyKey,
            workflowCarrierCode: carrier.code,
            returnCode: returnCode,
            refundTransactionCode: refundTransactionCode,
            returnRequest: returnRequest,
            refundCalculation: refundCalculation,
            refundTransaction: refundTransaction,
            currentState: request.currentState || source.currentState || prior.currentState || prior.state || reverseRun.state,
            recovery: request.recovery || source.recovery || prior.recovery || reverseRun.recovery,
            consignmentCode: request.consignmentCode || source.consignmentCode,
            shipmentCode: request.shipmentCode || source.shipmentCode,
            returnShipmentCode: request.returnShipmentCode || source.returnShipmentCode,
            returnReasonCode: request.returnReasonCode || source.returnReasonCode || (this.config().returnRequest || {}).defaultReturnReasonCode,
            returnType: request.returnType || source.returnType || (this.config().returnRequest || {}).defaultReturnType,
            requestedQuantity: request.requestedQuantity || source.requestedQuantity,
            receivedQuantity: request.receivedQuantity || source.receivedQuantity || request.requestedQuantity || source.requestedQuantity,
            allocationCodes: request.allocationCodes || source.allocationCodes,
            inventoryAllocationCodes: request.inventoryAllocationCodes || source.inventoryAllocationCodes,
            itemCodes: request.itemCodes || source.itemCodes,
            dispositionCode: request.dispositionCode || source.dispositionCode || (returnRequest && returnRequest.dispositionCode) || (this.config().returnRequest || {}).defaultDispositionCode,
            inspectionResult: request.inspectionResult || source.inspectionResult || (returnRequest && returnRequest.inspectionResult),
            inventoryDispositionIntent: request.inventoryDispositionIntent || source.inventoryDispositionIntent || (returnRequest && returnRequest.inventoryDispositionIntent),
            inventoryDispositionResult: request.inventoryDispositionResult || prior.inventoryDispositionResult,
            refundPolicyCode: request.refundPolicyCode || source.refundPolicyCode,
            paymentAllocations: request.paymentAllocations || request.orderPaymentAllocations || source.paymentAllocations || source.orderPaymentAllocations,
            paymentGroupCode: request.paymentGroupCode || source.paymentGroupCode || (refundCalculation && refundCalculation.paymentGroupCode),
            paymentModeCode: request.paymentModeCode || source.paymentModeCode,
            providerCode: request.providerCode || source.providerCode,
            refundAmount: request.refundAmount || request.amount || source.refundAmount || source.amount || (refundCalculation && refundCalculation.amount),
            currencyCode: request.currencyCode || source.currencyCode || (refundCalculation && refundCalculation.currencyCode),
        };
    },
    /** Extracts generated-service or direct arrays. */
    items: function (value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.items)) return value.items;
        return [value];
    },
    /** Resolves actor evidence for order history. */
    actor: function (authData) {
        return {
            actorType: authData && authData.tokenType === 'service' ? 'SERVICE' : 'EMPLOYEE',
            actorCode: authData && (authData.principalId || authData.code || authData.username),
        };
    },
    /** Builds the standard success decision for a checkout reverse Workflow action. */
    success: function (name, feedback) {
        return {
            decision: 'SUCCESS',
            type: 'SUCCESS',
            feedback: Object.assign({ action: name }, feedback || {})
        };
    },
    /** Returns the configured reverse compensation policy. */
    compensationConfig: function () {
        return (this.config().compensation || {});
    },
    /** Trims a safe operator-visible failure message according to configuration. */
    safeFailureMessage: function (failure) {
        let compensation = this.compensationConfig();
        let limit = Number(compensation.failureMessageLimit || this.config().failureMessageLimit || 240);
        return String((failure && failure.message) || 'Checkout reverse workflow failed').slice(0, limit);
    },
    /** Infers the latest business state reached before compensation. */
    currentReverseState: function (evidence, failure) {
        if (failure && (failure.currentState || failure.state)) return failure.currentState || failure.state;
        if (evidence.currentState) return evidence.currentState;
        if (evidence.refundTransactionCode || evidence.refundTransaction) return 'REFUNDED';
        if (evidence.refundCalculation) return 'REFUND_CALCULATED';
        if ((evidence.inventoryDispositionResult || {}).status === 'INVENTORY_DISPOSITION_APPLIED') return 'INVENTORY_DISPOSITION_APPLIED';
        if (evidence.inventoryDispositionIntent) return 'RETURN_DISPOSED';
        let returnStatus = (evidence.returnRequest || {}).status;
        if (returnStatus === 'CLOSED') return 'RETURN_DISPOSED';
        if (returnStatus === 'RECEIVED') return 'RETURN_RECEIVED';
        if (returnStatus === 'APPROVED') return 'RETURN_APPROVED';
        if (evidence.returnCode) return 'RETURN_REQUESTED';
        return 'RUNNING';
    },
    /** Resolves owning modules that must complete a recovery strategy. */
    recoveryOwners: function (strategy) {
        if (strategy === 'FULFILLMENT_REVIEW_REQUIRED') return ['fulfillment'];
        if (strategy === 'INVENTORY_REVIEW_REQUIRED') return ['inventory'];
        if (strategy === 'PAYMENT_RETRY_REQUIRED') return ['payment'];
        if (strategy === 'ORDER_RETRY_REQUIRED' || strategy === 'ORDER_HISTORY_RETRY_REQUIRED') return ['order'];
        return [];
    },
    /** Builds safe owner-delegated recovery guidance for a failed reverse workflow. */
    recoveryPlan: function (evidence, failure) {
        let compensation = this.compensationConfig();
        let currentState = this.currentReverseState(evidence, failure || {});
        let strategy = ((compensation.recoveryStrategies || {})[currentState]) || 'OPERATOR_REVIEW_REQUIRED';
        let requiredOwners = this.recoveryOwners(strategy);
        let ownerActionsConfig = compensation.ownerActions || {};
        let ownerActions = requiredOwners.reduce((result, owner) => {
            result[owner] = ownerActionsConfig[owner] || [];
            return result;
        }, {});
        return {
            currentState: currentState,
            strategy: strategy,
            requiredOwners: requiredOwners,
            ownerActions: ownerActions,
            retryable: strategy !== 'NO_COMPENSATION_REQUIRED',
            message: this.safeFailureMessage(failure || {}),
        };
    },
    /** Saves Order-owned reverse-run evidence. */
    saveRun: async function (request, evidence, state, currentStep, patch) {
        let recovery = evidence.recovery || {};
        let model = Object.assign({
            entCode: evidence.entCode,
            reverseCode: evidence.reverseCode,
            orderCode: evidence.orderCode,
            returnCode: evidence.returnCode,
            refundCalculationCode: evidence.refundCalculation && evidence.refundCalculation.calculationCode,
            refundTransactionCode: evidence.refundTransactionCode,
            workflowCarrierCode: evidence.workflowCarrierCode,
            idempotencyKey: evidence.idempotencyKey,
            state: state,
            currentStep: currentStep,
            recoveryStrategy: recovery.strategy,
            recoveryOwner: (recovery.requiredOwners || [])[0],
            evidence: {
                returnCode: evidence.returnCode,
                refundCalculationCode: evidence.refundCalculation && evidence.refundCalculation.calculationCode,
                refundTransactionCode: evidence.refundTransactionCode,
                requestedQuantity: evidence.requestedQuantity,
                receivedQuantity: evidence.receivedQuantity,
                dispositionCode: evidence.dispositionCode,
                inventoryDispositionIntent: evidence.inventoryDispositionIntent,
                inventoryDispositionStatus: evidence.inventoryDispositionResult && evidence.inventoryDispositionResult.status,
                refundAmount: evidence.refundAmount,
                currencyCode: evidence.currencyCode,
                recovery: recovery.strategy ? recovery : undefined,
            }
        }, patch || {});
        if (SERVICE.DefaultCheckoutReverseRunService && typeof SERVICE.DefaultCheckoutReverseRunService.save === 'function') {
            let saved = await SERVICE.DefaultCheckoutReverseRunService.save({
                tenant: request.tenant,
                authData: request.authData,
                model: model
            });
            return saved && (saved.result && saved.result[0] || saved);
        }
        return model;
    },
    /** Starts Order-owned reverse-run evidence. */
    startReverseRun: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        let reverseRun = await this.saveRun(request, evidence, 'RUNNING', 'startReverseRun');
        return this.success('startReverseRun', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            reverseRun: reverseRun
        });
    },
    /** Requests Fulfillment-owned return evidence. */
    requestReturn: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if (!SERVICE.DefaultReturnRequestService || typeof SERVICE.DefaultReturnRequestService.requestReturn !== 'function') {
            throw this.error('Fulfillment return request service is unavailable', 'ERR_ORD_00032');
        }
        let returnRequest = await SERVICE.DefaultReturnRequestService.requestReturn(Object.assign({}, request, {
            workflowCarrier: carrier,
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            returnCode: evidence.returnCode,
            idempotencyKey: [evidence.idempotencyKey, 'return'].filter(Boolean).join('::'),
            consignmentCode: evidence.consignmentCode,
            shipmentCode: evidence.shipmentCode,
            returnReasonCode: evidence.returnReasonCode,
            returnType: evidence.returnType,
            requestedQuantity: evidence.requestedQuantity,
            allocationCodes: evidence.allocationCodes,
            inventoryAllocationCodes: evidence.inventoryAllocationCodes,
            itemCodes: evidence.itemCodes,
        }));
        evidence.returnCode = returnRequest && returnRequest.returnCode;
        await this.saveRun(request, evidence, 'RETURN_REQUESTED', 'requestReturn');
        return this.success('requestReturn', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            returnRequest: returnRequest
        });
    },
    /** Approves Fulfillment-owned return evidence. */
    approveReturn: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if (!evidence.returnCode) throw this.error('Checkout reverse approval requires returnCode', 'ERR_ORD_00033');
        if (!SERVICE.DefaultReturnRequestService || typeof SERVICE.DefaultReturnRequestService.approveReturn !== 'function') {
            throw this.error('Fulfillment return approval service is unavailable', 'ERR_ORD_00033');
        }
        let returnRequest = await SERVICE.DefaultReturnRequestService.approveReturn(Object.assign({}, request, {
            workflowCarrier: carrier,
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            returnCode: evidence.returnCode,
            dispositionCode: evidence.dispositionCode,
            refundPolicyCode: evidence.refundPolicyCode,
        }));
        await this.saveRun(request, evidence, 'RETURN_APPROVED', 'approveReturn');
        return this.success('approveReturn', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            returnRequest: returnRequest
        });
    },
    /** Records Fulfillment-owned received return evidence. */
    receiveReturn: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if (!evidence.returnCode) throw this.error('Checkout reverse receipt requires returnCode', 'ERR_ORD_00034');
        if (!SERVICE.DefaultReturnRequestService || typeof SERVICE.DefaultReturnRequestService.receiveReturn !== 'function') {
            throw this.error('Fulfillment return receive service is unavailable', 'ERR_ORD_00034');
        }
        let returnRequest = await SERVICE.DefaultReturnRequestService.receiveReturn(Object.assign({}, request, {
            workflowCarrier: carrier,
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            returnCode: evidence.returnCode,
            receivedQuantity: evidence.receivedQuantity,
        }));
        await this.saveRun(request, evidence, 'RETURN_RECEIVED', 'receiveReturn');
        return this.success('receiveReturn', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            returnRequest: returnRequest
        });
    },
    /** Closes Fulfillment-owned return evidence with inspection or disposition results. */
    disposeReturn: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if (!evidence.returnCode) throw this.error('Checkout reverse disposition requires received return evidence', 'ERR_ORD_00038');
        if (!SERVICE.DefaultReturnRequestService || typeof SERVICE.DefaultReturnRequestService.closeReturn !== 'function') {
            throw this.error('Fulfillment return disposition service is unavailable', 'ERR_ORD_00038');
        }
        let returnRequest = await SERVICE.DefaultReturnRequestService.closeReturn(Object.assign({}, request, {
            workflowCarrier: carrier,
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            returnCode: evidence.returnCode,
            dispositionCode: evidence.dispositionCode,
            inspectionResult: evidence.inspectionResult,
            receivedQuantity: evidence.receivedQuantity,
        }));
        evidence.returnRequest = returnRequest;
        evidence.dispositionCode = returnRequest && returnRequest.dispositionCode;
        evidence.inventoryDispositionIntent = returnRequest && returnRequest.inventoryDispositionIntent;
        await this.saveRun(request, evidence, 'RETURN_DISPOSED', 'disposeReturn', {
            evidence: {
                returnCode: evidence.returnCode,
                dispositionCode: evidence.dispositionCode,
                inventoryDispositionIntent: evidence.inventoryDispositionIntent,
            }
        });
        return this.success('disposeReturn', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            dispositionCode: evidence.dispositionCode,
            inventoryDispositionIntent: evidence.inventoryDispositionIntent,
            returnRequest: returnRequest
        });
    },
    /** Applies Inventory-owned movement evidence for returned goods disposition when required. */
    applyInventoryDisposition: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        let config = this.config().inventoryDisposition || {};
        if (config.enabled === false || !evidence.inventoryDispositionIntent) {
            let skipped = { status: 'NO_INVENTORY_DISPOSITION_REQUIRED', movements: [] };
            evidence.inventoryDispositionResult = skipped;
            await this.saveRun(request, evidence, 'INVENTORY_DISPOSITION_APPLIED', 'applyInventoryDisposition', {
                evidence: {
                    returnCode: evidence.returnCode,
                    dispositionCode: evidence.dispositionCode,
                    inventoryDispositionStatus: skipped.status,
                }
            });
            return this.success('applyInventoryDisposition', {
                orderCode: evidence.orderCode,
                reverseCode: evidence.reverseCode,
                workflowCarrierCode: carrier.code,
                returnCode: evidence.returnCode,
                inventoryDispositionResult: skipped
            });
        }
        let serviceName = config.service || 'DefaultReturnDispositionMovementService';
        let service = SERVICE[serviceName];
        if (!service || typeof service.execute !== 'function') {
            throw this.error('Inventory return disposition service is unavailable', 'ERR_ORD_00039');
        }
        let inventoryDispositionResult = await service.execute(Object.assign({}, request, {
            workflowCarrierCode: carrier.code,
            idempotencyKey: evidence.idempotencyKey,
            dispositionIntent: evidence.inventoryDispositionIntent,
            inventoryDispositionIntent: evidence.inventoryDispositionIntent,
        }));
        evidence.inventoryDispositionResult = inventoryDispositionResult;
        await this.saveRun(request, evidence, 'INVENTORY_DISPOSITION_APPLIED', 'applyInventoryDisposition', {
            evidence: {
                returnCode: evidence.returnCode,
                dispositionCode: evidence.dispositionCode,
                inventoryDispositionStatus: inventoryDispositionResult && inventoryDispositionResult.status,
                inventoryMovementCount: (inventoryDispositionResult && inventoryDispositionResult.movements || []).length,
            }
        });
        return this.success('applyInventoryDisposition', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            inventoryDispositionResult: inventoryDispositionResult
        });
    },
    /** Loads Order-owned payment allocation evidence for Payment refund calculation. */
    loadPaymentAllocations: async function (request, evidence) {
        let direct = this.items(evidence.paymentAllocations || request.paymentAllocations || request.orderPaymentAllocations);
        if (direct.length) return direct;
        let paymentRefund = this.config().paymentRefund || {};
        let serviceName = paymentRefund.allocationSourceService || 'DefaultOrderPaymentAllocationService';
        let service = SERVICE[serviceName];
        if (!service || typeof service.get !== 'function') {
            throw this.error('Order payment allocation service is unavailable for refund calculation', 'ERR_ORD_00037');
        }
        let query = { orderCode: evidence.orderCode };
        if (evidence.paymentGroupCode) query.paymentGroupCode = evidence.paymentGroupCode;
        let result = await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: query,
            searchOptions: { limit: Number(paymentRefund.maximumAggregateRecords || 1000) + 1 },
        });
        let allocations = this.items(result);
        if (allocations.length > Number(paymentRefund.maximumAggregateRecords || 1000)) {
            throw this.error('Checkout reverse refund calculation exceeds configured allocation bounds', 'ERR_ORD_00037');
        }
        return allocations;
    },
    /** Calculates Payment-owned refund evidence without deciding Workflow routing. */
    calculateRefundEvidence: async function (request, carrier, evidence) {
        if (!SERVICE.DefaultPaymentRefundCalculationService || typeof SERVICE.DefaultPaymentRefundCalculationService.calculate !== 'function') {
            throw this.error('Payment refund calculation service is unavailable', 'ERR_ORD_00037');
        }
        let paymentAllocations = await this.loadPaymentAllocations(request, evidence);
        let refundCalculation = SERVICE.DefaultPaymentRefundCalculationService.calculate(Object.assign({}, request, {
            workflowCarrier: carrier,
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            returnCode: evidence.returnCode,
            idempotencyKey: [evidence.idempotencyKey, 'refundCalculation'].filter(Boolean).join('::'),
            paymentGroupCode: evidence.paymentGroupCode,
            allocationCodes: evidence.allocationCodes,
            paymentAllocations: paymentAllocations,
            refundAmount: evidence.refundAmount,
            amount: evidence.refundAmount,
            currencyCode: evidence.currencyCode,
        }));
        evidence.refundCalculation = refundCalculation;
        evidence.refundAmount = refundCalculation.amount;
        evidence.currencyCode = refundCalculation.currencyCode;
        evidence.paymentGroupCode = refundCalculation.paymentGroupCode;
        return refundCalculation;
    },
    /** Calculates Payment-owned refundable amount before provider refund execution. */
    calculateRefund: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if (!evidence.returnCode) throw this.error('Checkout reverse refund calculation requires received return evidence', 'ERR_ORD_00037');
        let refundCalculation = await this.calculateRefundEvidence(request, carrier, evidence);
        await this.saveRun(request, evidence, 'REFUND_CALCULATED', 'calculateRefund', {
            evidence: {
                returnCode: evidence.returnCode,
                refundCalculationCode: refundCalculation.calculationCode,
                refundAmount: refundCalculation.amount,
                currencyCode: refundCalculation.currencyCode,
            }
        });
        return this.success('calculateRefund', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            refundCalculation: refundCalculation
        });
    },
    /** Creates Payment-owned refund transaction evidence. */
    refundPayment: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        if ((this.config().paymentRefund || {}).requireReceivedReturnBeforeRefund && !evidence.returnCode) {
            throw this.error('Checkout reverse refund requires received return evidence', 'ERR_ORD_00035');
        }
        if ((this.config().paymentRefund || {}).calculateBeforeRefund !== false && !evidence.refundCalculation) {
            throw this.error('Checkout reverse refund requires calculated refund evidence', 'ERR_ORD_00035');
        }
        if (!SERVICE.DefaultPaymentRefundService || typeof SERVICE.DefaultPaymentRefundService.refund !== 'function') {
            throw this.error('Payment refund service is unavailable', 'ERR_ORD_00035');
        }
        let refundCalculation = evidence.refundCalculation || {};
        let refundTransaction = await SERVICE.DefaultPaymentRefundService.refund(Object.assign({}, request, {
            workflowCarrier: carrier,
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            returnCode: evidence.returnCode,
            idempotencyKey: [evidence.idempotencyKey, 'refund'].filter(Boolean).join('::'),
            paymentGroupCode: refundCalculation.paymentGroupCode || evidence.paymentGroupCode,
            paymentModeCode: evidence.paymentModeCode,
            providerCode: evidence.providerCode,
            amount: refundCalculation.amount || evidence.refundAmount,
            currencyCode: refundCalculation.currencyCode || evidence.currencyCode,
        }));
        evidence.refundTransactionCode = refundTransaction && refundTransaction.transactionCode;
        await this.saveRun(request, evidence, 'REFUNDED', 'refundPayment');
        return this.success('refundPayment', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            refundTransactionCode: evidence.refundTransactionCode,
            refundTransaction: refundTransaction
        });
    },
    /** Delegates Fulfillment-owned return review after compensation selected FULFILLMENT_REVIEW_REQUIRED. */
    recoverFulfillment: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        let recovery = evidence.recovery || this.recoveryPlan(evidence, { state: evidence.currentState });
        if (recovery.strategy !== 'FULFILLMENT_REVIEW_REQUIRED') {
            throw this.error('Checkout reverse fulfillment recovery requires FULFILLMENT_REVIEW_REQUIRED strategy', 'ERR_ORD_00042');
        }
        let returnRequest = this.config().returnRequest || {};
        let serviceName = returnRequest.recoveryService || 'DefaultReturnRequestService';
        let service = SERVICE[serviceName];
        if (!service || typeof service.reviewReturnRecovery !== 'function') {
            throw this.error('Fulfillment return recovery service is unavailable', 'ERR_ORD_00042');
        }
        if (!evidence.returnCode) throw this.error('Checkout reverse fulfillment recovery requires returnCode', 'ERR_ORD_00042');
        let fulfillmentRecovery = await service.reviewReturnRecovery(Object.assign({}, request, {
            workflowCarrier: carrier,
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            returnCode: evidence.returnCode,
            recoveryAction: request.recoveryAction || request.fulfillmentRecoveryAction || 'REVIEW_RETURN',
        }));
        evidence.recovery = Object.assign({}, recovery, {
            fulfillmentRecoveryAction: fulfillmentRecovery.recoveryAction,
            fulfillmentRecoveryStatus: fulfillmentRecovery.recoveryStatus,
            fulfillmentRecovered: fulfillmentRecovery.recovered,
        });
        await this.saveRun(request, evidence, 'COMPENSATING', 'recoverFulfillment', {
            recoveryStrategy: recovery.strategy,
            recoveryOwner: 'fulfillment',
            evidence: {
                returnCode: evidence.returnCode,
                recovery: evidence.recovery,
                fulfillmentRecoveryStatus: fulfillmentRecovery.recoveryStatus,
            }
        });
        return this.success('recoverFulfillment', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            recovery: evidence.recovery,
            fulfillmentRecovery: fulfillmentRecovery
        });
    },
    /** Delegates Inventory-owned disposition review after compensation selected INVENTORY_REVIEW_REQUIRED. */
    recoverInventory: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        let recovery = evidence.recovery || this.recoveryPlan(evidence, { state: evidence.currentState });
        if (recovery.strategy !== 'INVENTORY_REVIEW_REQUIRED') {
            throw this.error('Checkout reverse inventory recovery requires INVENTORY_REVIEW_REQUIRED strategy', 'ERR_ORD_00043');
        }
        let inventoryDisposition = this.config().inventoryDisposition || {};
        let serviceName = inventoryDisposition.recoveryService || inventoryDisposition.service || 'DefaultReturnDispositionMovementService';
        let service = SERVICE[serviceName];
        if (!service || typeof service.reviewDispositionRecovery !== 'function') {
            throw this.error('Inventory disposition recovery service is unavailable', 'ERR_ORD_00043');
        }
        if (!evidence.inventoryDispositionIntent) {
            throw this.error('Checkout reverse inventory recovery requires disposition intent', 'ERR_ORD_00043');
        }
        let inventoryRecovery = await service.reviewDispositionRecovery(Object.assign({}, request, {
            workflowCarrierCode: carrier.code,
            idempotencyKey: evidence.idempotencyKey,
            dispositionIntent: evidence.inventoryDispositionIntent,
            inventoryDispositionIntent: evidence.inventoryDispositionIntent,
            recoveryAction: request.recoveryAction || request.inventoryRecoveryAction || 'REVIEW_DISPOSITION_MOVEMENT',
        }));
        evidence.recovery = Object.assign({}, recovery, {
            inventoryRecoveryAction: inventoryRecovery.recoveryAction,
            inventoryRecoveryStatus: inventoryRecovery.recoveryStatus,
            inventoryRecovered: inventoryRecovery.recovered,
        });
        let state = inventoryRecovery.recovered ? 'INVENTORY_DISPOSITION_APPLIED' : 'COMPENSATING';
        await this.saveRun(request, evidence, state, 'recoverInventory', {
            recoveryStrategy: recovery.strategy,
            recoveryOwner: 'inventory',
            evidence: {
                returnCode: evidence.returnCode,
                dispositionCode: evidence.dispositionCode,
                recovery: evidence.recovery,
                inventoryRecoveryStatus: inventoryRecovery.recoveryStatus,
                inventoryMovementCodes: inventoryRecovery.movementCodes,
            }
        });
        return this.success('recoverInventory', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            recovery: evidence.recovery,
            inventoryRecovery: inventoryRecovery
        });
    },
    /** Delegates Payment-owned refund retry or reconciliation after compensation selected PAYMENT_RETRY_REQUIRED. */
    recoverPayment: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        let recovery = evidence.recovery || this.recoveryPlan(evidence, { state: evidence.currentState });
        if (recovery.strategy !== 'PAYMENT_RETRY_REQUIRED') {
            throw this.error('Checkout reverse payment recovery requires PAYMENT_RETRY_REQUIRED strategy', 'ERR_ORD_00040');
        }
        let paymentRefund = this.config().paymentRefund || {};
        let serviceName = paymentRefund.recoveryService || 'DefaultPaymentRefundService';
        let service = SERVICE[serviceName];
        if (!service || typeof service.retryRefund !== 'function') {
            throw this.error('Payment refund recovery service is unavailable', 'ERR_ORD_00040');
        }
        if (paymentRefund.calculateBeforeRefund !== false && !evidence.refundCalculation) {
            await this.calculateRefundEvidence(request, carrier, evidence);
        }
        let refundCalculation = evidence.refundCalculation || {};
        let recoveryAction = request.recoveryAction || request.paymentRecoveryAction || 'RETRY_REFUND';
        let paymentRecovery = recoveryAction === 'RECONCILE_PROVIDER_REFUND' && typeof service.reconcileRefund === 'function'
            ? await service.reconcileRefund(Object.assign({}, request, {
                workflowCarrier: carrier,
                entCode: evidence.entCode,
                orderCode: evidence.orderCode,
                returnCode: evidence.returnCode,
                refundTransactionCode: evidence.refundTransactionCode,
                idempotencyKey: [evidence.idempotencyKey, 'refund'].filter(Boolean).join('::'),
                paymentGroupCode: refundCalculation.paymentGroupCode || evidence.paymentGroupCode,
                paymentModeCode: evidence.paymentModeCode,
                providerCode: evidence.providerCode,
                amount: refundCalculation.amount || evidence.refundAmount,
                currencyCode: refundCalculation.currencyCode || evidence.currencyCode,
            }))
            : await service.retryRefund(Object.assign({}, request, {
                workflowCarrier: carrier,
                entCode: evidence.entCode,
                orderCode: evidence.orderCode,
                returnCode: evidence.returnCode,
                idempotencyKey: [evidence.idempotencyKey, 'refund'].filter(Boolean).join('::'),
                paymentGroupCode: refundCalculation.paymentGroupCode || evidence.paymentGroupCode,
                paymentModeCode: evidence.paymentModeCode,
                providerCode: evidence.providerCode,
                amount: refundCalculation.amount || evidence.refundAmount,
                currencyCode: refundCalculation.currencyCode || evidence.currencyCode,
            }));
        evidence.refundTransactionCode = paymentRecovery.transactionCode || paymentRecovery.refundTransactionCode || evidence.refundTransactionCode;
        evidence.recovery = Object.assign({}, recovery, {
            paymentRecoveryAction: paymentRecovery.recoveryAction || recoveryAction,
            paymentRecoveryStatus: paymentRecovery.status,
            paymentRecovered: paymentRecovery.recovered,
        });
        let state = paymentRecovery.recovered === false ? 'COMPENSATING' : 'REFUNDED';
        await this.saveRun(request, evidence, state, 'recoverPayment', {
            recoveryStrategy: recovery.strategy,
            recoveryOwner: 'payment',
            evidence: {
                returnCode: evidence.returnCode,
                refundCalculationCode: evidence.refundCalculation && evidence.refundCalculation.calculationCode,
                refundTransactionCode: evidence.refundTransactionCode,
                recovery: evidence.recovery,
            }
        });
        return this.success('recoverPayment', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            refundTransactionCode: evidence.refundTransactionCode,
            recovery: evidence.recovery,
            paymentRecovery: paymentRecovery
        });
    },
    /** Builds stable reverse history model from safe Workflow evidence. */
    reverseHistoryModel: function (request, evidence) {
        let actor = this.actor(request.authData);
        return {
            entCode: evidence.entCode,
            orderCode: evidence.orderCode,
            historyCode: evidence.idempotencyKey + ':reverse',
            eventType: (this.config().history || {}).eventType || 'ORDER_REVERSE_FLOW',
            statusTo: (this.config().history || {}).completedStatus || 'RETURN_REFUNDED',
            reasonCode: evidence.returnReasonCode,
            actorType: actor.actorType,
            actorCode: actor.actorCode,
            sourceModule: 'order',
            sourceOperation: 'checkoutReverseWorkflow.recordHistory',
            evidenceCode: evidence.reverseCode,
            message: 'Checkout reverse business workflow coordinated return and refund evidence'
        };
    },
    /** Loads existing reverse history to keep recovery retries idempotent. */
    existingReverseHistory: async function (request, historyCode) {
        if (!SERVICE.DefaultOrderHistoryEntryService || typeof SERVICE.DefaultOrderHistoryEntryService.get !== 'function') return undefined;
        let response = await SERVICE.DefaultOrderHistoryEntryService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { historyCode: historyCode },
            searchOptions: { limit: 2 },
        });
        let entries = this.items(response);
        if (entries.length > 1) throw this.error('Checkout reverse history recovery resolved duplicate history records', 'ERR_ORD_00041');
        return entries[0];
    },
    /** Saves reverse history once and returns existing evidence on retry. */
    saveReverseHistory: async function (request, evidence) {
        if (!evidence.returnCode || !evidence.refundTransactionCode) {
            throw this.error('Checkout reverse history requires return and refund evidence', 'ERR_ORD_00036');
        }
        if (!SERVICE.DefaultOrderHistoryEntryService || typeof SERVICE.DefaultOrderHistoryEntryService.save !== 'function') {
            throw this.error('Order History generated service is unavailable', 'ERR_ORD_00036');
        }
        let model = this.reverseHistoryModel(request, evidence);
        let existing = await this.existingReverseHistory(request, model.historyCode);
        if (existing) return Object.assign({ idempotent: true }, existing);
        let history = await SERVICE.DefaultOrderHistoryEntryService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: model
        });
        return history && (history.result && history.result[0] || history);
    },
    /** Records Order lifecycle history after Fulfillment return and Payment refund evidence exist. */
    recordHistory: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        let historyEntry = await this.saveReverseHistory(request, evidence);
        return this.success('recordHistory', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            refundTransactionCode: evidence.refundTransactionCode,
            historyEntry: historyEntry
        });
    },
    /** Retries Order-owned history evidence after compensation selected ORDER_HISTORY_RETRY_REQUIRED. */
    recoverHistory: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        let recovery = evidence.recovery || this.recoveryPlan(evidence, { state: evidence.currentState });
        if (recovery.strategy !== 'ORDER_HISTORY_RETRY_REQUIRED') {
            throw this.error('Checkout reverse history recovery requires ORDER_HISTORY_RETRY_REQUIRED strategy', 'ERR_ORD_00041');
        }
        let historyEntry = await this.saveReverseHistory(request, evidence);
        evidence.recovery = Object.assign({}, recovery, {
            orderRecoveryAction: 'RETRY_HISTORY',
            historyRecovered: true,
            historyCode: historyEntry && historyEntry.historyCode,
        });
        await this.saveRun(request, evidence, 'REFUNDED', 'recoverHistory', {
            recoveryStrategy: recovery.strategy,
            recoveryOwner: 'order',
            evidence: {
                returnCode: evidence.returnCode,
                refundTransactionCode: evidence.refundTransactionCode,
                recovery: evidence.recovery,
            }
        });
        return this.success('recoverHistory', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            refundTransactionCode: evidence.refundTransactionCode,
            recovery: evidence.recovery,
            historyEntry: historyEntry
        });
    },
    /** Completes the reverse business Workflow after owner evidence is recorded. */
    completeReverse: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        let reverseRun = await this.saveRun(request, evidence, 'COMPLETED', 'completeReverse', {
            evidence: {
                returnCode: evidence.returnCode,
                refundTransactionCode: evidence.refundTransactionCode,
                completed: true,
            }
        });
        return this.success('completeReverse', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            returnCode: evidence.returnCode,
            refundTransactionCode: evidence.refundTransactionCode,
            reverseRun: reverseRun
        });
    },
    /** Records safe failure evidence. Production compensation can be layered in project modules. */
    compensateReverse: async function (request) {
        let { carrier, source } = this.source(request);
        let evidence = this.evidence(request, carrier, source);
        let failure = request.error || request.failure || {};
        let compensation = this.compensationConfig();
        let recovery = this.recoveryPlan(evidence, failure);
        evidence.recovery = recovery;
        let reverseRun = await this.saveRun(request, evidence, compensation.state || 'COMPENSATING', 'compensateReverse', {
            failureCode: failure.code || compensation.failureCode || 'CHECKOUT_REVERSE_FAILED',
            failureMessage: recovery.message,
            recoveryStrategy: recovery.strategy,
            recoveryOwner: recovery.requiredOwners[0],
            evidence: Object.assign({}, evidence.recovery ? { recovery: evidence.recovery } : {}, {
                returnCode: evidence.returnCode,
                refundCalculationCode: evidence.refundCalculation && evidence.refundCalculation.calculationCode,
                refundTransactionCode: evidence.refundTransactionCode,
                inventoryDispositionStatus: evidence.inventoryDispositionResult && evidence.inventoryDispositionResult.status,
                failureCode: failure.code || compensation.failureCode || 'CHECKOUT_REVERSE_FAILED',
                failureMessage: recovery.message,
            }),
        });
        return this.success('compensateReverse', {
            orderCode: evidence.orderCode,
            reverseCode: evidence.reverseCode,
            workflowCarrierCode: carrier.code,
            recovery: recovery,
            compensation: reverseRun
        });
    }
};
