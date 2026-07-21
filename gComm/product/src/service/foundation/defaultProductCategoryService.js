/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/foundation/DefaultProductCategoryService @description Validates Product-owned Category hierarchy and effective Item assignments inside an nCatalog-owned Catalog. @layer service @owner product */
module.exports = {
    /** Initializes Category validation. */ init: function () { return Promise.resolve(true); },
    /** Completes Category validation initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns Product policy. */ config: function () { return CONFIG.get('product') || {}; },
    /** Creates a stable Product error. */ error: function (code, message) { return SERVICE.DefaultProductEnterpriseScopeService.error(code, message); },
    /** Extracts result items from a generated service response. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Validates an effective-date range. */ assertDates: function (model) { if (model.effectiveFrom && model.effectiveTo && new Date(model.effectiveFrom).getTime() > new Date(model.effectiveTo).getTime()) throw this.error('ERR_PRODUCT_00014', 'Product Category effective date range is invalid'); },
    /** Validates an integer inside configured bounds. */ assertInteger: function (value, minimum, maximum, label) { let number = Number(value); if (!Number.isInteger(number) || number < Number(minimum) || number > Number(maximum)) throw this.error('ERR_PRODUCT_00014', label + ' is outside configured bounds'); },
    /** Loads exactly one non-retired Category in trusted scope. */ loadCategory: async function (model, categoryCode, request) { let response = await SERVICE.DefaultProductCategoryService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: model.enterpriseCode, catalogCode: model.catalogCode, categoryCode: categoryCode }, searchOptions: { limit: 2 } }), items = this.items(response); return items.length === 1 && items[0].status !== 'RETIRED' ? items[0] : undefined; },
    /** Walks the parent chain with cycle and depth protection. */ validateParent: async function (model, request) {
        if (!model.parentCategoryCode) return true;
        if (model.parentCategoryCode === model.categoryCode) throw this.error('ERR_PRODUCT_00015', 'A Product Category cannot parent itself');
        let maximumDepth = Number((this.config().category || {}).maximumDepth || 32), visited = new Set([model.categoryCode]), currentCode = model.parentCategoryCode, depth = 0;
        while (currentCode) {
            if (visited.has(currentCode)) throw this.error('ERR_PRODUCT_00015', 'Product Category hierarchy contains a cycle');
            if (++depth > maximumDepth) throw this.error('ERR_PRODUCT_00015', 'Product Category hierarchy exceeds configured depth');
            visited.add(currentCode); let current = await this.loadCategory(model, currentCode, request);
            if (!current) throw this.error('ERR_PRODUCT_00015', 'Product parent Category is missing or retired');
            currentCode = current.parentCategoryCode;
        }
        return true;
    },
    /** Validates and scopes a Category. */ prepareCategory: async function (request) {
        let model = request.model || {}, policy = this.config().category || {};
        SERVICE.DefaultProductEnterpriseScopeService.scopeNewModel(request, 'category', ['catalogCode', 'categoryCode']); model = request.model;
        if (!model.name || typeof model.name !== 'string' || !(policy.statuses || []).includes(model.status || 'DRAFT')) throw this.error('ERR_PRODUCT_00014', 'Product Category name or status is invalid');
        this.assertInteger(model.order === undefined ? 100 : model.order, policy.minimumOrder, policy.maximumOrder, 'Product Category order'); this.assertDates(model);
        await SERVICE.DefaultProductReferenceService.validate('catalog', model.catalogCode, request); await this.validateParent(model, request); return model;
    },
    /** Validates and scopes an Item-to-Category assignment. */ prepareAssignment: async function (request) {
        let model = request.model || {}, policy = this.config().categoryAssignment || {};
        SERVICE.DefaultProductEnterpriseScopeService.scopeNewModel(request, 'categoryAssignment', ['catalogCode', 'assignmentCode']); model = request.model;
        if (!(this.config().item.itemTypes || []).includes(model.itemType) || !(policy.statuses || []).includes(model.status || 'DRAFT')) throw this.error('ERR_PRODUCT_00017', 'Product Category assignment type or status is invalid');
        this.assertInteger(model.position === undefined ? 100 : model.position, policy.minimumPosition, policy.maximumPosition, 'Product Category assignment position'); this.assertDates(model);
        await SERVICE.DefaultProductReferenceService.validate('catalog', model.catalogCode, request);
        let category = await this.loadCategory(model, model.categoryCode, request), itemResponse = await SERVICE.DefaultProductItemService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: model.enterpriseCode, catalogCode: model.catalogCode, itemType: model.itemType, itemCode: model.itemCode }, searchOptions: { limit: 2 } }), items = this.items(itemResponse);
        if (!category || items.length !== 1 || items[0].status === 'RETIRED') throw this.error('ERR_PRODUCT_00017', 'Product Category assignment reference is invalid'); return model;
    },
    /** Prevents Category retirement while active children or assignments exist. */ assertRetirable: async function (current, request) {
        let query = { enterpriseCode: current.enterpriseCode, catalogCode: current.catalogCode, status: { $ne: 'RETIRED' } }, childQuery = Object.assign({}, query, { parentCategoryCode: current.categoryCode }), assignmentQuery = Object.assign({}, query, { categoryCode: current.categoryCode });
        let responses = await Promise.all([SERVICE.DefaultProductCategoryService.get({ tenant: request.tenant, authData: request.authData, query: childQuery, searchOptions: { limit: 1 } }), SERVICE.DefaultProductCategoryAssignmentService.get({ tenant: request.tenant, authData: request.authData, query: assignmentQuery, searchOptions: { limit: 1 } })]);
        if (this.items(responses[0]).length || this.items(responses[1]).length) throw this.error('ERR_PRODUCT_00016', 'Retire child Categories and Item assignments first'); return true;
    },
    /** Validates immutable identity, lifecycle, and references for one Category-owned update. */ update: async function (request, serviceName, identityProperties, prepareName, policyName) {
        await SERVICE.DefaultProductEnterpriseScopeService.scopeQuery(request); let response = await SERVICE[serviceName].get({ tenant: request.tenant, authData: request.authData, query: request.query, searchOptions: { limit: 2 } }), items = this.items(response);
        if (items.length !== 1) throw this.error('ERR_PRODUCT_00012', 'Product Category update target must resolve exactly one record'); let current = items[0], patch = request.model || {};
        ['code', 'enterpriseCode'].concat(identityProperties).forEach(property => { if (patch[property] !== undefined && patch[property] !== current[property]) throw this.error('ERR_PRODUCT_00011', 'Product Category identity is immutable'); });
        if (patch.status && patch.status !== current.status) { let allowed = ((((this.config()[policyName] || {}).allowedTransitions || {})[current.status]) || []); if (!allowed.includes(patch.status)) throw this.error('ERR_PRODUCT_00011', 'Product Category lifecycle transition is invalid'); }
        if (serviceName === 'DefaultProductCategoryService' && patch.status === 'RETIRED' && current.status !== 'RETIRED') await this.assertRetirable(current, request);
        let validationRequest = Object.assign({}, request, { model: Object.assign({}, current, patch) }); await this[prepareName](validationRequest); request.model = patch; return true;
    },
    /** Validates a Category update and any changed hierarchy. */ prepareCategoryUpdate: function (request) { return this.update(request, 'DefaultProductCategoryService', ['catalogCode', 'categoryCode'], 'prepareCategory', 'category'); },
    /** Validates an Item-to-Category assignment update. */ prepareAssignmentUpdate: function (request) { return this.update(request, 'DefaultProductCategoryAssignmentService', ['catalogCode', 'assignmentCode', 'categoryCode', 'itemType', 'itemCode'], 'prepareAssignment', 'categoryAssignment'); }
};
