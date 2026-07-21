/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/service/resolution/DefaultPriceResolutionService @description Deterministically resolves the best exact Price from active scoped Price Lists. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the config Pricing contract. */
    config: function () { return CONFIG.get('pricing') || {}; },
    /** Executes the items Pricing contract. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Executes the error Pricing contract. */
    error: function (code, message) { return SERVICE.DefaultPricingEnterpriseScopeService.error(code, message); },
    /** Executes the effective Pricing contract. */
    effective: function (record, timestamp) { let from = record.effectiveFrom && new Date(record.effectiveFrom).getTime(), to = record.effectiveTo && new Date(record.effectiveTo).getTime(); return record.status === 'ACTIVE' && (!from || from <= timestamp) && (!to || to >= timestamp); },
    /** Executes the decimalParts Pricing contract. */
    decimalParts: function (value) { let parts = String(value).split('.'); return { digits: BigInt((parts[0] + (parts[1] || '')).replace(/^0+(?=\d)/, '')), scale: (parts[1] || '').length }; },
    /** Executes the compareDecimal Pricing contract. */
    compareDecimal: function (left, right) { let a = this.decimalParts(left), b = this.decimalParts(right), scale = Math.max(a.scale, b.scale); let x = a.digits * (10n ** BigInt(scale - a.scale)), y = b.digits * (10n ** BigInt(scale - b.scale)); return x < y ? -1 : x > y ? 1 : 0; },
    /** Executes the validateRequest Pricing contract. */
    validateRequest: function (request) {
        request = request || {}; let body = request.body || request, config = this.config().resolution || {}, context = body.context || {};
        if (!body.item || !body.item.itemCode || !body.item.itemType || !body.quantity || !body.unitCode || !/^[A-Z]{3}$/.test(body.currencyCode || '')) throw this.error('ERR_PRICE_00030', 'Item, exact quantity, unit, and currency are required');
        SERVICE.DefaultPricingValidationService.assertDecimal(body.quantity, 'Quantity', false);
        if (Object.keys(context).some(key => !config.contextKeys.includes(key) || key.startsWith('$'))) throw this.error('ERR_PRICE_00031', 'Resolution context contains an unsupported key');
        Object.keys(context).forEach(key => { let value = context[key]; if (Array.isArray(value) && value.length > Number(config.maximumContextValues || 100)) throw this.error('ERR_PRICE_00031', 'Resolution context exceeds configured bounds'); });
        return { body: body, context: context };
    },
    /** Executes the scopeValues Pricing contract. */
    scopeValues: function (enterpriseCode, context) { return {
        ENTERPRISE: [enterpriseCode], COUNTRY: [context.countryCode], SITE: [context.siteCode], STORE: [context.storeCode], CHANNEL: [context.channelCode],
        CUSTOMER: [context.customerCode], CUSTOMER_SEGMENT: context.customerSegmentCodes || []
    }; },
    /** Executes the asynchronous groupCodes Pricing contract. */
    groupCodes: async function (enterpriseCode, groupType, memberCodes, request, timestamp) {
        memberCodes = Array.from(new Set((memberCodes || []).filter(Boolean))); if (!memberCodes.length) return [];
        let memberships = this.items(await SERVICE.DefaultPriceGroupMemberService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, memberCode: { $in: memberCodes }, status: 'ACTIVE' }, searchOptions: { limit: Number((this.config().priceGroup || {}).maximumMembers || 10000) } }));
        let codes = Array.from(new Set(memberships.filter(item => this.effective(item, timestamp)).map(item => item.priceGroupCode)));
        if (!codes.length) return [];
        let groups = this.items(await SERVICE.DefaultPriceGroupService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, priceGroupCode: { $in: codes }, groupType: groupType, status: 'ACTIVE' } }));
        return groups.filter(item => this.effective(item, timestamp)).map(item => item.priceGroupCode);
    },
    /** Executes the asynchronous loadLists Pricing contract. */
    loadLists: async function (enterpriseCode, context, request, timestamp) {
        let values = this.scopeValues(enterpriseCode, context), specificity = (this.config().assignment || {}).scopeSpecificity || {};
        let assignments = this.items(await SERVICE.DefaultPriceListAssignmentService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, status: 'ACTIVE' }, searchOptions: { limit: Number((this.config().resolution || {}).maximumCandidates || 5000) } }))
            .filter(item => this.effective(item, timestamp) && (values[item.scopeType] || []).includes(item.scopeCode));
        let excluded = new Set(assignments.filter(item => item.excluded).map(item => item.priceListCode));
        let applicable = assignments.filter(item => !item.excluded && !excluded.has(item.priceListCode));
        let codes = Array.from(new Set(applicable.map(item => item.priceListCode))); if (!codes.length) return [];
        let lists = this.items(await SERVICE.DefaultPriceListService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, priceListCode: { $in: codes }, status: 'ACTIVE' } })).filter(item => this.effective(item, timestamp));
        let byCode = new Map(lists.map(item => [item.priceListCode, item]));
        return applicable.filter(item => byCode.has(item.priceListCode)).map(item => ({ assignment: item, list: byCode.get(item.priceListCode), specificity: Number(specificity[item.scopeType] || 0) }));
    },
    /** Executes the matchesPrice Pricing contract. */
    matchesPrice: function (price, input, groups, timestamp) {
        if (!this.effective(price, timestamp) || price.currencyCode !== input.currencyCode || price.unitCode !== input.unitCode || price.channelCode && price.channelCode !== input.context.channelCode || this.compareDecimal(price.minimumQuantity, input.quantity) > 0) return false;
        let itemMatch = price.itemCode ? price.itemCode === input.item.itemCode && (!price.itemType || price.itemType === input.item.itemType) : groups.item.includes(price.itemPriceGroupCode);
        let customerMatch = !price.customerCode && !price.customerPriceGroupCode || price.customerCode === input.context.customerCode || groups.customer.includes(price.customerPriceGroupCode) || groups.segment.includes(price.customerPriceGroupCode) || groups.contract.includes(price.customerPriceGroupCode);
        return itemMatch && customerMatch;
    },
    /** Executes the rank Pricing contract. */
    rank: function (candidate) { let price = candidate.price; return [candidate.specificity, price.customerCode ? 4 : price.customerPriceGroupCode ? 3 : 1, price.itemCode ? 2 : 1, price.minimumQuantity, -Number(candidate.assignment.priority), -Number(candidate.list.priority)]; },
    /** Executes the compareRank Pricing contract. */
    compareRank: function (left, right) { let a = this.rank(left), b = this.rank(right); for (let i = 0; i < a.length; i++) { let result = i === 3 ? this.compareDecimal(a[i], b[i]) : a[i] < b[i] ? -1 : a[i] > b[i] ? 1 : 0; if (result) return -result; } return 0; },
    /** Executes the asynchronous resolve Pricing contract. */
    resolve: async function (request) {
        let validated = this.validateRequest(request), input = Object.assign({}, validated.body, { context: validated.context });
        let enterpriseCode = SERVICE.DefaultPricingEnterpriseScopeService.resolveEnterpriseCode(request), timestamp = input.at ? new Date(input.at).getTime() : Date.now();
        if (!Number.isFinite(timestamp)) throw this.error('ERR_PRICE_00032', 'Resolution time is invalid');
        let lists = await this.loadLists(enterpriseCode, input.context, request, timestamp); if (!lists.length) throw this.error('ERR_PRICE_00033', 'No applicable active price list was found');
        let groups = {
            item: await this.groupCodes(enterpriseCode, 'ITEM', [input.item.itemCode], request, timestamp),
            customer: await this.groupCodes(enterpriseCode, 'CUSTOMER', [input.context.customerCode].concat(input.context.customerGroupCodes || []), request, timestamp),
            segment: await this.groupCodes(enterpriseCode, 'CUSTOMER_SEGMENT', input.context.customerSegmentCodes || [], request, timestamp),
            contract: await this.groupCodes(enterpriseCode, 'CONTRACT', input.context.contractCodes || [], request, timestamp)
        };
        let listCodes = Array.from(new Set(lists.map(item => item.list.priceListCode)));
        let prices = this.items(await SERVICE.DefaultPriceService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, priceListCode: { $in: listCodes }, currencyCode: input.currencyCode, status: 'ACTIVE' }, searchOptions: { limit: Number((this.config().resolution || {}).maximumCandidates || 5000) } }));
        let candidates = []; lists.forEach(binding => prices.filter(price => price.priceListCode === binding.list.priceListCode && this.matchesPrice(price, input, groups, timestamp)).forEach(price => candidates.push(Object.assign({ price: price }, binding))));
        if (!candidates.length) throw this.error('ERR_PRICE_00034', 'No exact applicable price was found'); candidates.sort((a, b) => this.compareRank(a, b) || String(a.price.priceCode).localeCompare(String(b.price.priceCode)));
        if ((this.config().resolution || {}).failOnAmbiguity !== false && candidates[1] && this.compareRank(candidates[0], candidates[1]) === 0) throw this.error('ERR_PRICE_00035', 'Price resolution is ambiguous');
        let winner = candidates[0], taxMode = winner.price.taxMode || winner.list.taxMode;
        return { enterpriseCode: enterpriseCode, priceCode: winner.price.priceCode, priceListCode: winner.list.priceListCode,
            amount: winner.price.amount, currencyCode: winner.price.currencyCode, unitCode: winner.price.unitCode, unitFactor: winner.price.unitFactor,
            minimumQuantity: winner.price.minimumQuantity, taxMode: taxMode, scopeType: winner.assignment.scopeType, scopeCode: winner.assignment.scopeCode,
            evaluatedAt: new Date(timestamp).toISOString(), evidence: { assignmentCode: winner.assignment.assignmentCode, priceVersion: winner.price.versionId, priceListVersion: winner.list.versionId } };
    }
};
