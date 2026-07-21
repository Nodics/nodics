/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/service/foundation/DefaultPricingValidationService @description Validates governed Pricing records without duplicating referenced authorities. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the config Pricing contract. */
    config: function () { return CONFIG.get('pricing') || {}; },
    /** Executes the error Pricing contract. */
    error: function (code, message) { return SERVICE.DefaultPricingEnterpriseScopeService.error(code, message); },
    /** Executes the assertDateRange Pricing contract. */
    assertDateRange: function (model) { if (model.effectiveFrom && model.effectiveTo && new Date(model.effectiveFrom).getTime() > new Date(model.effectiveTo).getTime()) throw this.error('ERR_PRICE_00010', 'Effective date range is invalid'); },
    /** Executes the assertPriority Pricing contract. */
    assertPriority: function (value, policy) { let number = Number(value); if (!Number.isInteger(number) || number < Number(policy.minimumPriority) || number > Number(policy.maximumPriority)) throw this.error('ERR_PRICE_00011', 'Priority is outside configured bounds'); },
    /** Executes the assertDecimal Pricing contract. */
    assertDecimal: function (value, label, allowZero) {
        let policy = this.config().price || {}, text = String(value === undefined ? '' : value);
        if (!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(text) || (!allowZero && /^0(?:\.0+)?$/.test(text))) throw this.error('ERR_PRICE_00012', label + ' must be a positive exact decimal string');
        let parts = text.split('.'); if ((parts[0] + (parts[1] || '')).length > Number(policy.maximumDigits || 38) || (parts[1] || '').length > Number(policy.maximumScale || 18)) throw this.error('ERR_PRICE_00012', label + ' exceeds exact-decimal bounds');
        return text;
    },
    /** Executes the prepare Pricing contract. */
    prepare: function (request, type, identityProperties) { SERVICE.DefaultPricingEnterpriseScopeService.scopeNewModel(request, type, identityProperties); this.assertDateRange(request.model); return request.model; },
    /** Executes the preparePriceList Pricing contract. */
    preparePriceList: function (request) {
        let model = this.prepare(request, 'priceList', ['priceListCode']), policy = this.config().priceList;
        this.assertPriority(model.priority === undefined ? 100 : model.priority, policy);
        if (!Array.isArray(model.currencies) || !model.currencies.length || model.currencies.some(code => !/^[A-Z]{3}$/.test(code))) throw this.error('ERR_PRICE_00013', 'Price list currencies must contain ISO-style three-letter codes');
        if (!policy.taxModes.includes(model.taxMode || 'NET') || !policy.stackingModes.includes(model.stackingMode || 'EXCLUSIVE')) throw this.error('ERR_PRICE_00013', 'Price list policy is invalid');
        return true;
    },
    /** Executes the prepareAssignment Pricing contract. */
    prepareAssignment: function (request) {
        let model = this.prepare(request, 'priceListAssignment', ['assignmentCode']), policy = this.config().assignment;
        if (!policy.scopeTypes.includes(model.scopeType)) throw this.error('ERR_PRICE_00014', 'Assignment scope type is unsupported'); this.assertPriority(model.priority === undefined ? 100 : model.priority, policy); return true;
    },
    /** Executes the prepareGroup Pricing contract. */
    prepareGroup: function (request) {
        let model = this.prepare(request, 'priceGroup', ['priceGroupCode']); if (!this.config().priceGroup.groupTypes.includes(model.groupType)) throw this.error('ERR_PRICE_00015', 'Price group type is unsupported'); return true;
    },
    /** Executes the prepareMembership Pricing contract. */
    prepareMembership: function (request) { this.prepare(request, 'priceGroupMember', ['membershipCode']); return true; },
    /** Executes the preparePrice Pricing contract. */
    preparePrice: function (request) {
        let model = this.prepare(request, 'price', ['priceCode']), policy = this.config().price;
        if (Boolean(model.itemCode) === Boolean(model.itemPriceGroupCode)) throw this.error('ERR_PRICE_00016', 'Price requires exactly one item or item price group');
        if (model.customerCode && model.customerPriceGroupCode) throw this.error('ERR_PRICE_00016', 'Price cannot target a customer and customer price group together');
        model.amount = this.assertDecimal(model.amount, 'Amount', true); model.minimumQuantity = this.assertDecimal(model.minimumQuantity || '1', 'Minimum quantity', false);
        if (!/^[A-Z]{3}$/.test(model.currencyCode || '') || !Number.isInteger(Number(model.unitFactor)) || Number(model.unitFactor) < 1 || Number(model.unitFactor) > Number(policy.maximumUnitFactor)) throw this.error('ERR_PRICE_00017', 'Price currency or unit factor is invalid');
        return true;
    },
    /** Executes the asynchronous prepareAssignmentWithReferences Pricing contract. */
    prepareAssignmentWithReferences: async function (request) { this.prepareAssignment(request); let kind = { STORE: 'store', CUSTOMER: 'customer', CUSTOMER_SEGMENT: 'customerSegment' }[request.model.scopeType]; if (kind) await SERVICE.DefaultPricingReferenceService.validate(kind, request.model.scopeCode, request); return true; },
    /** Executes the asynchronous preparePriceWithReferences Pricing contract. */
    preparePriceWithReferences: async function (request) { this.preparePrice(request); await SERVICE.DefaultPricingReferenceService.validate('item', request.model.itemCode, request); await SERVICE.DefaultPricingReferenceService.validate('customer', request.model.customerCode, request); await SERVICE.DefaultPricingReferenceService.validate('unit', request.model.unitCode, request); return true; },
    /** Executes the asynchronous prepareMembershipWithReferences Pricing contract. */
    prepareMembershipWithReferences: async function (request) { this.prepareMembership(request); let kind = { ITEM: 'item', CUSTOMER: 'customer', CUSTOMER_SEGMENT: 'customerSegment' }[request.model.memberType]; if (kind) await SERVICE.DefaultPricingReferenceService.validate(kind, request.model.memberCode, request); return true; },
    /** Executes the asynchronous update Pricing contract. */
    update: async function (request, schema, serviceName, identityProperties, prepareName) {
        await SERVICE.DefaultPricingEnterpriseScopeService.scopeQuery(request); let response = await SERVICE[serviceName].get({ tenant: request.tenant, authData: request.authData, query: request.query, searchOptions: { limit: 2 } });
        let items = response && Array.isArray(response.result) ? response.result : []; if (items.length !== 1) throw this.error('ERR_PRICE_00019', 'Pricing update target must resolve exactly one record');
        let current = items[0], patch = request.model || {}; ['code', 'enterpriseCode'].concat(identityProperties).forEach(property => { if (patch[property] !== undefined && patch[property] !== current[property]) throw this.error('ERR_PRICE_00018', 'Pricing identity is immutable'); });
        if (patch.status && patch.status !== current.status) { let allowed = (((this.config().lifecycle || {}).allowedTransitions || {})[current.status]) || []; if (!allowed.includes(patch.status)) throw this.error('ERR_PRICE_00018', 'Pricing lifecycle transition is invalid'); }
        let merged = Object.assign({}, current, patch), validationRequest = Object.assign({}, request, { model: merged }); await this[prepareName](validationRequest); request.model = patch; return true;
    },
    /** Executes the preparePriceListUpdate Pricing contract. */
    preparePriceListUpdate: function (request) { return this.update(request, 'priceList', 'DefaultPriceListService', ['priceListCode'], 'preparePriceList'); },
    /** Executes the prepareAssignmentUpdate Pricing contract. */
    prepareAssignmentUpdate: function (request) { return this.update(request, 'priceListAssignment', 'DefaultPriceListAssignmentService', ['assignmentCode', 'priceListCode', 'scopeType', 'scopeCode'], 'prepareAssignmentWithReferences'); },
    /** Executes the prepareGroupUpdate Pricing contract. */
    prepareGroupUpdate: function (request) { return this.update(request, 'priceGroup', 'DefaultPriceGroupService', ['priceGroupCode', 'groupType'], 'prepareGroup'); },
    /** Executes the prepareMembershipUpdate Pricing contract. */
    prepareMembershipUpdate: function (request) { return this.update(request, 'priceGroupMember', 'DefaultPriceGroupMemberService', ['membershipCode', 'priceGroupCode', 'memberType', 'memberCode'], 'prepareMembershipWithReferences'); },
    /** Executes the preparePriceUpdate Pricing contract. */
    preparePriceUpdate: function (request) { return this.update(request, 'price', 'DefaultPriceService', ['priceCode', 'priceListCode'], 'preparePriceWithReferences'); },
    /** Executes the rejectHardDelete Pricing contract. */
    rejectHardDelete: function () { return Promise.reject(this.error('ERR_PRICE_00018', 'Pricing history cannot be hard-deleted; retire it')); }
};
