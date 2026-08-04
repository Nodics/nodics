/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/lifecycle/DefaultOrderCancellationExecutionService
 * @description Implements replaceable cancellation execution Pipeline nodes while owner modules retain their mutations.
 * @layer service
 * @owner order
 * @override Projects may replace nodes or owner services while preserving Workflow checkpoints, exact quantities, idempotency, and authority boundaries.
 */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    config: function () { return (((CONFIG.get('order') || {}).orderLifecycle || {}).cancellationExecution) || {}; },
    error: function (message, code) { if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00053'); let error = new Error(message); error.code = code || 'ERR_ORD_00053'; return error; },
    items: function (value) { if (!value) return []; if (Array.isArray(value)) return value; if (Array.isArray(value.result)) return value.result; if (Array.isArray(value.items)) return value.items; return [value]; },
    affected: function (value) { let result = value && value.result !== undefined ? value.result : value; return Number(result && (result.modifiedCount !== undefined ? result.modifiedCount : result.nModified !== undefined ? result.nModified : result.n) || 0); },
    safe: function (value) { if (/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload|rawCarrier|carrierPayload|warehousePath/i.test(JSON.stringify(value || {}))) throw this.error('Cancellation execution contains unsafe owner evidence'); },
    input: function (request) { return request && request.cancellationExecution || {}; },
    exact: function (value) { if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) throw this.error('Cancellation execution quantity must be an exact decimal string'); let parts = value.split('.'); return { units: BigInt(parts.join('')), scale: (parts[1] || '').length }; },
    add: function (left, right) { let a = this.exact(left); let b = this.exact(right); let scale = Math.max(a.scale, b.scale); let units = a.units * 10n ** BigInt(scale - a.scale) + b.units * 10n ** BigInt(scale - b.scale); let digits = units.toString().padStart(scale + 1, '0'); return scale ? (digits.slice(0, -scale) || '0') + '.' + digits.slice(-scale) : digits; },
    compare: function (left, right) { let a = this.exact(left); let b = this.exact(right); let scale = Math.max(a.scale, b.scale); let x = a.units * 10n ** BigInt(scale - a.scale); let y = b.units * 10n ** BigInt(scale - b.scale); return x === y ? 0 : x < y ? -1 : 1; },
    subtract: function (left, right) { let a = this.exact(left); let b = this.exact(right); let scale = Math.max(a.scale, b.scale); let units = a.units * 10n ** BigInt(scale - a.scale) - b.units * 10n ** BigInt(scale - b.scale); if (units < 0n) throw this.error('Cancellation execution quantity plan became negative'); let digits = units.toString().padStart(scale + 1, '0'); return scale ? (digits.slice(0, -scale) || '0') + '.' + digits.slice(-scale) : digits; },
    validate: function (request) {
        let input = this.input(request); this.safe(input);
        if (this.config().enabled === false || !request || !request.tenant || !request.authData || !input.request || input.request.requestType !== 'CANCELLATION' || !['APPROVED', 'EXECUTING'].includes(input.request.state)) throw this.error('Cancellation execution requires an approved immutable request');
        if (!Array.isArray(input.items) || !input.items.length || !input.request.evidence || Number(input.request.evidence.requestVersion) !== Number(input.request.version) || input.request.evidence.approvalDecision !== 'APPROVED') throw this.error('Cancellation execution approval evidence is missing or stale', 'ERR_ORD_00054');
        if (!input.request.evidence.calculation || !input.request.evidence.eligibility) throw this.error('Cancellation execution requires bound eligibility and calculation evidence');
        return input;
    },
    service: function (name) { let service = SERVICE[this.config()[name]]; if (!service) throw this.error('Cancellation owner service is unavailable: ' + name); return service; },
    checkpoint: async function (request, response, step, ownerEvidence) {
        let input = response.cancellationExecutionInput; let current = response.executionRequest || input.request;
        let evidence = Object.assign({}, current.evidence || {}, { execution: Object.assign({}, (current.evidence || {}).execution || {}, { currentStep: step, ownerEvidence: Object.assign({}, (((current.evidence || {}).execution || {}).ownerEvidence) || {}, ownerEvidence || {}), updatedAt: new Date() }) });
        let updated = await SERVICE.DefaultOrderLifecycleOrchestrationService.updateState(request, current, [current.state], { state: 'EXECUTING', evidence: evidence }, false);
        await SERVICE.DefaultOrderLifecycleAuditService.record(request, updated, 'CANCELLATION_EXECUTION_CHECKPOINT', step, 'Cancellation execution checkpoint ' + step);
        response.executionRequest = updated; response.cancellationExecutionInput.request = updated; return updated;
    },
    fulfillmentItems: function (input) { let eligible = new Map([].concat(input.request.evidence.eligibility.items || []).map(value => [value.orderEntryCode, value])); return input.items.filter(item => ((eligible.get(item.orderEntryCode) || {}).evidence || {}).fulfillmentRequired !== false).map(item => ({ orderEntryCode: item.orderEntryCode, requestedQuantity: item.requestedQuantity, unitCode: item.unitCode, serialNumbers: item.serialNumbers || [] })); },
    inventoryPlans: function (input) {
        let plans = [];
        let eligibleByEntry = new Map([].concat(input.request.evidence.eligibility.items || []).map(value => [value.orderEntryCode, value]));
        input.items.forEach(item => { let evidence = item.immutableEvidence || {}; let eligible = eligibleByEntry.get(item.orderEntryCode) || {}; let availablePlans = [].concat(evidence.inventoryCancellationAllocations || eligible.evidence && eligible.evidence.inventoryCancellationAllocations || []).filter(Boolean).sort((left, right) => String(left.allocationCode).localeCompare(String(right.allocationCode)));
            if (!availablePlans.length && evidence.allocationCode) availablePlans = [{ allocationCode: evidence.allocationCode, quantity: item.requestedQuantity, unitCode: item.unitCode, serialNumbers: item.serialNumbers || [] }];
            let serials = [].concat(item.serialNumbers || []).filter(Boolean); let itemPlans = [];
            if (serials.length) availablePlans.forEach(plan => { let selected = serials.filter(serial => [].concat(plan.serialNumbers || []).includes(serial)); if (selected.length) itemPlans.push(Object.assign({}, plan, { quantity: String(selected.length), serialNumbers: selected })); });
            else { let remaining = item.requestedQuantity; availablePlans.forEach(plan => { if (this.compare(remaining, '0') <= 0) return; let take = this.compare(plan.quantity, remaining) <= 0 ? plan.quantity : remaining; itemPlans.push(Object.assign({}, plan, { quantity: take, serialNumbers: [] })); remaining = this.subtract(remaining, take); }); if (this.compare(remaining, '0') !== 0 && !(eligible.evidence && eligible.evidence.inventoryRequired === false)) throw this.error('Cancellation Inventory evidence cannot satisfy requested quantity'); }
            if (serials.length && itemPlans.reduce((count, plan) => count + plan.serialNumbers.length, 0) !== serials.length) throw this.error('Cancellation Inventory evidence cannot satisfy selected serials');
            itemPlans.forEach((plan, index) => plans.push(Object.assign({}, plan, { cancellationCode: [input.request.requestCode, item.orderEntryCode, plan.allocationCode || index].join('::'), requestVersion: input.request.version })));
        });
        return plans;
    },
    paymentAllocations: function (input) {
        let values = [].concat(input.request.evidence.calculation.paymentCalculation && input.request.evidence.calculation.paymentCalculation.allocationEvidence || []);
        return values.map(value => ({ paymentGroupCode: value.paymentGroupCode, originalTransactionCode: value.originalTransactionCode, providerCode: value.providerCode, paymentModeCode: value.paymentModeCode, amount: value.amount, currencyCode: value.currencyCode }));
    },
    validateExecution: async function (request, response, process) { try { response.cancellationExecutionInput = this.validate(request); await this.checkpoint(request, response, 'VALIDATED'); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    cancelFulfillment: async function (request, response, process) { try { let input = response.cancellationExecutionInput; let items = this.fulfillmentItems(input); let result = items.length ? await this.service('fulfillmentService').cancel(Object.assign({}, request, { body: { enterpriseCode: input.request.entCode, cancellationCode: input.request.requestCode, orderCode: input.request.orderCode, requestVersion: input.request.version, items: items } })) : { status: 'NO_FULFILLMENT_CANCELLATION_REQUIRED', items: [] }; this.safe(result); await this.checkpoint(request, response, 'FULFILLMENT_CANCELLED', { fulfillment: result }); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    cancelProductLifecycle: async function (request, response, process) { try { let input = response.cancellationExecutionInput; let byEntry = new Map([].concat(input.request.evidence.eligibility.items || []).map(value => [value.orderEntryCode, value])); let results = []; for (let item of input.items) { let eligible = byEntry.get(item.orderEntryCode) || {}, evidence = eligible.evidence || {}; results.push(await this.service('productLifecycleService').execute(Object.assign({}, request, { productLifecycleCancellation: { cancellationCode: input.request.requestCode, requestVersion: input.request.version, orderCode: input.request.orderCode, orderEntryCode: item.orderEntryCode, lifecycleType: evidence.lifecycleType || 'PHYSICAL', entitlementReference: evidence.entitlementReference, entitlementState: evidence.entitlementState, providerActionRequired: evidence.productProviderActionRequired === true, providerActionCode: evidence.productProviderActionCode } }))); } this.safe(results); await this.checkpoint(request, response, 'PRODUCT_LIFECYCLE_CANCELLED', { productLifecycle: results }); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    cancelInventory: async function (request, response, process) { try { let input = response.cancellationExecutionInput; let plans = this.inventoryPlans(input); if (plans.length > Number(this.config().maximumOwnerOperations || 300)) throw this.error('Cancellation Inventory operations exceed configured bounds'); let results = []; for (let plan of plans) results.push(await this.service('inventoryService').cancel(Object.assign({}, request, { body: plan, enterpriseCode: input.request.entCode }))); this.safe(results); await this.checkpoint(request, response, 'INVENTORY_CANCELLED', { inventory: results }); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    reversePayment: async function (request, response, process) { try { let input = response.cancellationExecutionInput; let allocations = this.paymentAllocations(input); if (allocations.some(value => !value.originalTransactionCode)) throw this.error('Cancellation Payment execution lacks original transaction evidence'); let result = await this.service('paymentService').execute(Object.assign({}, request, { body: { enterpriseCode: input.request.entCode, cancellationCode: input.request.requestCode, orderCode: input.request.orderCode, requestVersion: input.request.version, allocations: allocations } })); this.safe(result); await this.checkpoint(request, response, 'PAYMENT_REVERSED', { payment: result }); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    loadEntries: async function (request, input) { let result = await SERVICE.DefaultOrderEntryService.get({ tenant: request.tenant, authData: request.authData, query: { entCode: input.request.entCode, orderCode: input.request.orderCode }, searchOptions: { limit: Number(this.config().maximumOwnerOperations || 300) } }); return this.items(result); },
    finalizeEntries: async function (request, input, entries) {
        let selected = new Map(input.items.map(item => [item.orderEntryCode, item])); let results = [];
        for (let entry of entries) { let item = selected.get(entry.entryCode); if (!item) continue; if (entry.lastCancellationCode === input.request.requestCode) { results.push(entry); continue; }
            let cancelled = this.add(entry.cancelledQuantity || '0', item.requestedQuantity); if (this.compare(cancelled, entry.quantity) > 0) throw this.error('Order Entry cancellation exceeds ordered quantity', 'ERR_ORD_00054');
            let status = this.compare(cancelled, entry.quantity) === 0 ? 'CANCELLED' : entry.status; let revision = Number(entry.lifecycleRevision || 0);
            let updated = await SERVICE.DefaultOrderEntryService.update({ tenant: request.tenant, authData: request.authData, currentModel: entry, query: { entCode: input.request.entCode, orderCode: input.request.orderCode, entryCode: entry.entryCode, lifecycleRevision: revision }, model: { cancelledQuantity: cancelled, status: status, lastCancellationCode: input.request.requestCode, lifecycleRevision: revision + 1 } });
            if (this.affected(updated) !== 1) throw this.error('Order Entry cancellation revision conflict', 'ERR_ORD_00054'); results.push(Object.assign({}, entry, { cancelledQuantity: cancelled, status: status, lastCancellationCode: input.request.requestCode, lifecycleRevision: revision + 1 }));
        }
        if (results.length !== selected.size) throw this.error('Cancellation selection did not resolve all Order Entries'); return results;
    },
    finalizeOrderProjection: async function (request, input, entries) {
        let orderResult = await SERVICE.DefaultOrderService.get({ tenant: request.tenant, authData: request.authData, query: { entCode: input.request.entCode, code: input.request.orderCode }, searchOptions: { limit: 2 } }); let orders = this.items(orderResult); if (orders.length !== 1) throw this.error('Cancellation requires one Order projection'); let order = orders[0];
        if (order.lastCancellationCode === input.request.requestCode) return order;
        let allCancelled = entries.every(entry => this.compare(entry.cancelledQuantity || '0', entry.quantity) === 0); let status = allCancelled ? 'CANCELLED' : 'PARTIALLY_CANCELLED'; let revision = Number(order.lifecycleRevision || 0);
        let updated = await SERVICE.DefaultOrderService.update({ tenant: request.tenant, authData: request.authData, query: { entCode: input.request.entCode, code: input.request.orderCode, lifecycleRevision: revision }, model: { status: status, lastCancellationCode: input.request.requestCode, lifecycleRevision: revision + 1 } });
        if (this.affected(updated) !== 1) throw this.error('Order cancellation revision conflict', 'ERR_ORD_00054'); return Object.assign({}, order, { status: status, lastCancellationCode: input.request.requestCode, lifecycleRevision: revision + 1 });
    },
    history: async function (request, input, order) { let historyCode = input.request.requestCode + '::completed'; let existing = await SERVICE.DefaultOrderHistoryEntryService.get({ tenant: request.tenant, authData: request.authData, query: { entCode: input.request.entCode, historyCode: historyCode }, searchOptions: { limit: 2 } }); if (this.items(existing).length) return this.items(existing)[0]; let model = { active: true, entCode: input.request.entCode, orderCode: input.request.orderCode, historyCode: historyCode, eventType: 'CANCELLATION_COMPLETED', statusTo: order.status, reasonCode: input.request.reasonCode, actorType: 'WORKFLOW', actorCode: 'WORKFLOW', sourceModule: 'order', sourceOperation: 'orderCancellationExecutionPipeline', evidenceCode: input.request.requestCode, message: 'Approved cancellation execution completed' }; let saved = await SERVICE.DefaultOrderHistoryEntryService.save({ tenant: request.tenant, authData: request.authData, model: model }); return this.items(saved)[0] || model; },
    finalizeOrder: async function (request, response, process) { try { let input = response.cancellationExecutionInput; let allEntries = await this.loadEntries(request, input); let appliedEntries = await this.finalizeEntries(request, input, allEntries); let projected = allEntries.map(entry => appliedEntries.find(value => value.entryCode === entry.entryCode) || entry); let order = await this.finalizeOrderProjection(request, input, projected); let history = await this.history(request, input, order); await this.checkpoint(request, response, 'ORDER_FINALIZED', { order: { code: order.code, status: order.status, lifecycleRevision: order.lifecycleRevision }, history: { historyCode: history.historyCode } }); response.cancellationExecutionResult = { requestCode: input.request.requestCode, requestVersion: input.request.version, order: order, entries: appliedEntries, ownerEvidence: response.executionRequest.evidence.execution.ownerEvidence }; process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    handleSuccessEnd: function (request, response, process) { process.resolve(response.cancellationExecutionResult); },
    handleErrorEnd: function (request, response, process) { process.reject(response.error); },
};
