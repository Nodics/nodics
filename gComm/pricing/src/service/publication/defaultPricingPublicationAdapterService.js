/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/service/publication/DefaultPricingPublicationAdapterService @description Freezes exact Price List graphs for nPublish. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the items Pricing contract. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Selects the latest immutable version for every stable record code. */
    latestByCode: function (records) { return Array.from((records || []).reduce((map, record) => { let current = map.get(record.code); if (!current || Number(record.versionId || 0) > Number(current.versionId || 0)) map.set(record.code, record); return map; }, new Map()).values()); },
    /** Executes the asynchronous getVersion Pricing contract. */
    getVersion: async function (publication, request) { let response = await SERVICE.DefaultPriceListService.get({ tenant: request.tenant, authData: request.authData, query: { code: publication.rootCode, versionId: Number(publication.sourceVersion), active: true }, searchOptions: { limit: 1 } }); let model = this.items(response)[0]; if (!model) throw new CLASSES.NodicsError('ERR_PRICE_00050', 'Price List source version was not found'); return model; },
    /** Executes the identity Pricing contract. */
    identity: function (schema, model) { return { schema: schema, code: model.code, version: String(model.versionId) }; },
    /** Executes the asynchronous resolveDependencies Pricing contract. */
    resolveDependencies: async function (publication, root, request) {
        let enterpriseCode = root.enterpriseCode, priceListCode = root.priceListCode, max = Number(((CONFIG.get('pricing') || {}).publication || {}).maxDependencies || 10000);
        let dependencies = [this.identity('priceList', root)];
        for (let descriptor of [['priceListAssignment', 'DefaultPriceListAssignmentService'], ['price', 'DefaultPriceService']]) {
            let records = this.latestByCode(this.items(await SERVICE[descriptor[1]].get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: enterpriseCode, priceListCode: priceListCode, active: true }, searchOptions: { sort: { versionId: -1 } } })));
            records.forEach(model => dependencies.push(this.identity(descriptor[0], model)));
        }
        let groupCodes = new Set(); let prices = dependencies.filter(item => item.schema === 'price');
        for (let identity of prices) { let result = this.items(await SERVICE.DefaultPriceService.get({ tenant: request.tenant, authData: request.authData, query: { code: identity.code, versionId: Number(identity.version), active: true }, searchOptions: { limit: 1 } }))[0]; if (result && result.itemPriceGroupCode) groupCodes.add(result.itemPriceGroupCode); if (result && result.customerPriceGroupCode) groupCodes.add(result.customerPriceGroupCode); }
        if (groupCodes.size) {
            let groups = this.latestByCode(this.items(await SERVICE.DefaultPriceGroupService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: enterpriseCode, priceGroupCode: { $in: Array.from(groupCodes) }, active: true }, searchOptions: { sort: { versionId: -1 } } })));
            groups.forEach(model => dependencies.push(this.identity('priceGroup', model)));
            let members = this.latestByCode(this.items(await SERVICE.DefaultPriceGroupMemberService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: enterpriseCode, priceGroupCode: { $in: Array.from(groupCodes) }, active: true }, searchOptions: { sort: { versionId: -1 } } })));
            members.forEach(model => dependencies.push(this.identity('priceGroupMember', model)));
        }
        let unique = Array.from(dependencies.reduce((map, item) => { map.set(item.schema + ':' + item.code + ':' + item.version, item); return map; }, new Map()).values()).sort((left, right) => (left.schema + ':' + left.code + ':' + left.version).localeCompare(right.schema + ':' + right.code + ':' + right.version));
        if (unique.length > max) throw new CLASSES.NodicsError('ERR_PRICE_00051', 'Pricing publication exceeds configured dependency bounds'); return unique;
    },
    /** Executes the validate Pricing contract. */
    validate: function (publication, root, request, dependencies) { let keys = (dependencies || []).map(item => item.schema + ':' + item.code + ':' + item.version); return Promise.resolve({ valid: Boolean(root.enterpriseCode && root.priceListCode && keys.length === new Set(keys).size), rootVersion: root.versionId, dependencyCount: keys.length }); },
    /** Executes the afterActivate Pricing contract. */
    afterActivate: function (publication, activation, request) { return SERVICE.DefaultPriceResolutionCacheService.invalidate(request); },
    /** Executes the afterRollback Pricing contract. */
    afterRollback: function (publication, activation, request) { return SERVICE.DefaultPriceResolutionCacheService.invalidate(request); }
};
