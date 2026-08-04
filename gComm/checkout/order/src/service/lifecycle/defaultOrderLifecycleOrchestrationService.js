/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/lifecycle/DefaultOrderLifecycleOrchestrationService
 * @description Persists Order-owned lifecycle request aggregates atomically and submits immutable request versions to Workflow idempotently.
 * @layer service
 * @owner order
 * @override Project modules may replace repository or workflow selection while preserving atomic persistence, optimistic versions, and adjacent-owner boundaries.
 */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    config: function () { return ((CONFIG.get('order') || {}).orderLifecycle) || {}; },
    error: function (message, code) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00045');
        let error = new Error(message); error.code = code || 'ERR_ORD_00045'; return error;
    },
    items: function (value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.items)) return value.items;
        return [value];
    },
    affected: function (value) {
        if (typeof value === 'number') return value;
        return Number(value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.count !== undefined ? value.count : value.result && value.result.modifiedCount) || 0);
    },
    requireServices: function () {
        if (!SERVICE.DefaultOrderLifecycleRequestPolicyService || !SERVICE.DefaultOrderLifecycleRequestService ||
            !SERVICE.DefaultOrderLifecycleRequestItemService || !SERVICE.DefaultDatabaseTransactionService) {
            throw this.error('Order lifecycle persistence services are unavailable');
        }
    },
    loadRequest: async function (request, query, transactionContext) {
        let response = await SERVICE.DefaultOrderLifecycleRequestService.get({
            tenant: request.tenant, authData: request.authData, query: query,
            searchOptions: { limit: 2 }, transactionContext: transactionContext
        });
        let records = this.items(response);
        if (records.length > 1) throw this.error('Order lifecycle request resolved duplicate records');
        return records[0];
    },
    loadItems: async function (request, requestCode, transactionContext) {
        return this.items(await SERVICE.DefaultOrderLifecycleRequestItemService.get({
            tenant: request.tenant, authData: request.authData, query: { requestCode: requestCode },
            searchOptions: { limit: Number(this.config().maximumItemsPerRequest || 100) + 1 }, transactionContext: transactionContext
        }));
    },
    aggregate: async function (request, requestModel, idempotent) {
        return { request: requestModel, items: await this.loadItems(request, requestModel.requestCode), idempotent: idempotent === true };
    },
    createDraft: async function (request) {
        this.requireServices();
        let draft = SERVICE.DefaultOrderLifecycleRequestPolicyService.buildDraft(request);
        let existing = await this.loadRequest(request, { entCode: draft.request.entCode, idempotencyKey: draft.request.idempotencyKey });
        if (existing) return this.aggregate(request, existing, true);
        let persistence = this.config().persistence || {};
        return SERVICE.DefaultDatabaseTransactionService.execute({
            moduleName: persistence.transactionModuleName || 'order', tenant: request.tenant, test: request.test === true
        }, async transactionContext => {
            let concurrent = await this.loadRequest(request, { entCode: draft.request.entCode, idempotencyKey: draft.request.idempotencyKey }, transactionContext);
            if (concurrent) return { request: concurrent, items: await this.loadItems(request, concurrent.requestCode, transactionContext), idempotent: true };
            await SERVICE.DefaultOrderLifecycleRequestService.save({
                tenant: request.tenant, authData: request.authData, model: draft.request,
                transactionContext: transactionContext, _orderLifecycleMutationAuthorized: true
            });
            for (let item of draft.items) {
                await SERVICE.DefaultOrderLifecycleRequestItemService.save({
                    tenant: request.tenant, authData: request.authData, model: item,
                    transactionContext: transactionContext, _orderLifecycleMutationAuthorized: true
                });
            }
            return { request: draft.request, items: draft.items, idempotent: false };
        });
    },
    updateState: async function (request, current, expectedStates, patch, incrementVersion) {
        if (!expectedStates.includes(current.state)) throw this.error('Order lifecycle request state does not allow this operation', 'ERR_ORD_00046');
        let next = Object.assign({}, patch, {
            version: incrementVersion === false ? Number(current.version) : Number(current.version) + 1
        });
        let result = await SERVICE.DefaultOrderLifecycleRequestService.update({
            tenant: request.tenant, authData: request.authData,
            query: { requestCode: current.requestCode, entCode: current.entCode, state: current.state, version: current.version },
            model: next, _orderLifecycleMutationAuthorized: true
        });
        if (this.affected(result) !== 1) throw this.error('Order lifecycle request version conflict', 'ERR_ORD_00046');
        return Object.assign({}, current, next);
    },
    updateDecisionAggregate: async function (request, current, expectedStates, itemDecisions, patch) {
        this.requireServices();
        if (!expectedStates.includes(current.state)) throw this.error('Order lifecycle request state does not allow aggregate decision', 'ERR_ORD_00046');
        let persistence = this.config().persistence || {};
        return SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: persistence.transactionModuleName || 'order', tenant: request.tenant, test: request.test === true }, async transactionContext => {
            for (let decision of itemDecisions) {
                let itemResult = await SERVICE.DefaultOrderLifecycleRequestItemService.update({ tenant: request.tenant, authData: request.authData, query: { requestItemCode: decision.requestItemCode, requestCode: current.requestCode }, model: { approvedQuantity: decision.approvedQuantity, rejectedQuantity: decision.rejectedQuantity, decisionReasonCode: decision.decisionReasonCode, state: decision.state }, transactionContext: transactionContext, _orderLifecycleMutationAuthorized: true });
                if (this.affected(itemResult) !== 1) throw this.error('Order lifecycle item decision conflict', 'ERR_ORD_00046');
            }
            let requestResult = await SERVICE.DefaultOrderLifecycleRequestService.update({ tenant: request.tenant, authData: request.authData, query: { requestCode: current.requestCode, entCode: current.entCode, state: current.state, version: current.version }, model: Object.assign({}, patch, { version: Number(current.version) }), transactionContext: transactionContext, _orderLifecycleMutationAuthorized: true });
            if (this.affected(requestResult) !== 1) throw this.error('Order lifecycle aggregate decision conflict', 'ERR_ORD_00046');
            return Object.assign({}, current, patch);
        });
    },
    submit: async function (request) {
        this.requireServices();
        let input = request.orderLifecycle || request.body || {};
        if (!request.tenant || !request.authData || !input.requestCode || !input.entCode) throw this.error('Order lifecycle submission requires tenant, auth, enterprise, and request code');
        let current = await this.loadRequest(request, { requestCode: input.requestCode, entCode: input.entCode });
        if (!current) throw this.error('Order lifecycle request was not found');
        if (current.state === 'SUBMITTED') return this.aggregate(request, current, true);
        let pending = current;
        if (current.state !== 'SUBMISSION_PENDING' && current.state !== 'SUBMISSION_FAILED') {
            pending = await this.updateState(request, current, ['DRAFT', 'INFORMATION_PROVIDED'], { state: 'SUBMISSION_PENDING' });
        }
        let workflow = this.config().workflow || {};
        if (workflow.enabled === false || !SERVICE.DefaultWorkflowService) throw this.error('Order lifecycle Workflow is unavailable');
        let requestItems = await this.loadItems(request, pending.requestCode);
        try {
            let carrierCode = pending.workflowCarrierCode || [workflow.carrierPrefix || 'orderLifecycle', pending.requestCode, pending.version].join('::');
            if (!SERVICE.DefaultWorkflowCarrierService || !await SERVICE.DefaultWorkflowCarrierService.isCarrierAvailable({ tenant: request.tenant, authData: request.authData, carrierCode: carrierCode })) {
                await SERVICE.DefaultWorkflowService.initCarrier({
                    tenant: request.tenant, authData: request.authData,
                    workflowCode: input.workflowCode || (workflow.workflowCodeByRequestType || {})[pending.requestType] || workflow.defaultWorkflowCode,
                    releaseCarrier: true,
                    carrier: {
                        code: carrierCode, event: { enabled: true },
                        sourceDetail: {
                            processType: 'orderLifecycleRequest', entCode: pending.entCode, orderCode: pending.orderCode,
                            requestCode: pending.requestCode, requestType: pending.requestType, requestVersion: pending.version,
                            idempotencyKey: pending.idempotencyKey
                        },
                        items: requestItems.map(item => ({ active: true, schemaName: 'orderLifecycleRequestItem', code: item.requestItemCode, refId: item.orderEntryCode }))
                    }
                });
            }
            let submitted = await this.updateState(request, pending, ['SUBMISSION_PENDING', 'SUBMISSION_FAILED'], {
                state: 'SUBMITTED', workflowCarrierCode: carrierCode, submittedAt: new Date()
            }, false);
            return { request: submitted, items: requestItems, idempotent: false };
        } catch (error) {
            if (pending.state === 'SUBMISSION_PENDING') {
                try { await this.updateState(request, pending, ['SUBMISSION_PENDING'], { state: 'SUBMISSION_FAILED' }, false); } catch (ignored) { /* recovery will reconcile by request and carrier identity */ }
            }
            throw error;
        }
    }
};
