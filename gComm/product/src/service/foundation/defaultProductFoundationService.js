/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/foundation/DefaultProductFoundationService @description Validates Product Item and Identifier identity, lifecycle, and authoritative references. @layer service @owner product */
module.exports = {
    /** Initializes Product validation. */ init: function () { return Promise.resolve(true); },
    /** Completes Product validation initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns Product policy. */ config: function () { return CONFIG.get('product') || {}; },
    /** Creates a Product contract error. */ error: function (code, message) { return SERVICE.DefaultProductEnterpriseScopeService.error(code, message); },
    /** Validates a Product Item and derives trusted state. */ prepareItem: async function (request) {
        let model = request.model || {}, policy = this.config().item || {};
        SERVICE.DefaultProductEnterpriseScopeService.scopeNewModel(request, 'item', ['catalogCode', 'itemType', 'itemCode']); model = request.model;
        if (!(policy.itemTypes || []).includes(model.itemType)) throw this.error('ERR_PRODUCT_00010', 'Product item type is not configured');
        if (!model.name || typeof model.name !== 'string' || model.name.trim().length > Number(policy.maximumNameLength || 256)) throw this.error('ERR_PRODUCT_00010', 'Product item name is invalid');
        if (model.description && (typeof model.description !== 'string' || model.description.length > Number(policy.maximumDescriptionLength || 16384))) throw this.error('ERR_PRODUCT_00010', 'Product item description is invalid');
        if (!(policy.statuses || []).includes(model.status || 'DRAFT')) throw this.error('ERR_PRODUCT_00010', 'Product item status is invalid');
        if (model.sellable && !(policy.sellableTypes || []).includes(model.itemType)) throw this.error('ERR_PRODUCT_00010', 'Product item type cannot be sellable');
        if (model.stockManaged && !(policy.stockManagedTypes || []).includes(model.itemType)) throw this.error('ERR_PRODUCT_00010', 'Product item type cannot be stock managed');
        await SERVICE.DefaultProductReferenceService.validate('catalog', model.catalogCode, request);
        await SERVICE.DefaultProductReferenceService.validate('unit', model.baseUnitCode, request);
        return model;
    },
    /** Validates an alternate Product Identifier and its owning Item. */ prepareIdentifier: async function (request) {
        let model = request.model || {}, policy = this.config().identifier || {};
        SERVICE.DefaultProductEnterpriseScopeService.scopeNewModel(request, 'identifier', ['catalogCode', 'identifierCode']); model = request.model;
        if (!(this.config().item.itemTypes || []).includes(model.itemType) || !(policy.types || []).includes(model.identifierType)) throw this.error('ERR_PRODUCT_00013', 'Product identifier type is invalid');
        if (!model.identifierValue || typeof model.identifierValue !== 'string' || model.identifierValue.length > Number(policy.maximumValueLength || 256)) throw this.error('ERR_PRODUCT_00013', 'Product identifier value is invalid');
        await SERVICE.DefaultProductReferenceService.validate('catalog', model.catalogCode, request);
        let response = await SERVICE.DefaultProductItemService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: model.enterpriseCode, catalogCode: model.catalogCode, itemType: model.itemType, itemCode: model.itemCode }, searchOptions: { limit: 2 } });
        if (!response || !Array.isArray(response.result) || response.result.length !== 1 || response.result[0].status === 'RETIRED') throw this.error('ERR_PRODUCT_00021', 'Product identifier item reference is invalid');
        return model;
    },
    /** Validates immutable identity and lifecycle before an update. */ update: async function (request, serviceName, identityProperties, prepareName, policyName) {
        await SERVICE.DefaultProductEnterpriseScopeService.scopeQuery(request);
        let response = await SERVICE[serviceName].get({ tenant: request.tenant, authData: request.authData, query: request.query, searchOptions: { limit: 2 } }), items = response && Array.isArray(response.result) ? response.result : [];
        if (items.length !== 1) throw this.error('ERR_PRODUCT_00012', 'Product update target must resolve exactly one record');
        let current = items[0], patch = request.model || {};
        ['code', 'enterpriseCode'].concat(identityProperties).forEach(property => { if (patch[property] !== undefined && patch[property] !== current[property]) throw this.error('ERR_PRODUCT_00011', 'Product identity is immutable'); });
        if (patch.status && patch.status !== current.status) { let allowed = (((this.config()[policyName || 'item'] || {}).allowedTransitions || {})[current.status]) || []; if (!allowed.includes(patch.status)) throw this.error('ERR_PRODUCT_00011', 'Product lifecycle transition is invalid'); }
        let validationRequest = Object.assign({}, request, { model: Object.assign({}, current, patch) }); await this[prepareName](validationRequest); request.model = patch; return true;
    },
    /** Validates Product Item updates. */ prepareItemUpdate: function (request) { return this.update(request, 'DefaultProductItemService', ['catalogCode', 'itemType', 'itemCode'], 'prepareItem'); },
    /** Validates Product Identifier updates. */ prepareIdentifierUpdate: function (request) { return this.update(request, 'DefaultProductIdentifierService', ['catalogCode', 'identifierCode', 'itemType', 'itemCode', 'identifierType', 'identifierValue'], 'prepareIdentifier'); },
    /** Rejects destructive Product history removal. */ rejectHardDelete: function () { return Promise.reject(this.error('ERR_PRODUCT_00011', 'Product history cannot be hard-deleted; retire it')); }
};
