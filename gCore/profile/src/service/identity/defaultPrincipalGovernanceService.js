/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/service/identity/DefaultPrincipalGovernanceService
 * @description Enforces principal categories, active group assignment, and service-only API-key ownership before identity persistence.
 * @layer service
 * @owner profile
 * @override Project modules may add principal categories while preserving least privilege and active-group validation.
 */
module.exports = {
    /** Normalizes save and update payloads for governance validation. */
    normalizeModels: function (model) {
        return Array.isArray(model) ? model : [model || {}];
    },
    /** Applies update operators to a persisted principal for effective-state validation. */
    applyUpdate: function (existing, update) {
        let effective = Object.assign({}, existing || {});
        Object.keys(update || {}).filter(key => !key.startsWith('$')).forEach(key => { effective[key] = update[key]; });
        Object.assign(effective, update && update.$set || {});
        Object.keys(update && update.$unset || {}).forEach(key => { delete effective[key]; });
        return effective;
    },
    /** Validates fully materialized principal states. */
    validateModels: function (models) {
        models.forEach(model => {
            if (model.principalType && !['human', 'service', 'customer'].includes(model.principalType)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Invalid principal type: ' + model.principalType);
            if (model.principalType === 'service' && !(model.userGroups || []).includes('serviceAccountUserGroup')) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Service principals require serviceAccountUserGroup');
            if (model.principalType !== 'service' && (model.userGroups || []).includes('serviceAccountUserGroup')) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Only service principals may use serviceAccountUserGroup');
            if (model.principalType !== 'service' && (model.apiKey || model.apiKeyHash)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'API keys are restricted to service principals');
            if (model.principalType === 'service' && model.apiKey && (typeof model.apiKey !== 'string' || model.apiKey.length < 32)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Service API keys must contain at least 32 characters');
        });
    },
    /** Resolves the generated service for partial employee/customer updates. */
    getPrincipalService: function (request) {
        let schemaName = request.schemaModel && request.schemaModel.schemaName;
        if (schemaName === 'employee') return SERVICE.DefaultEmployeeService;
        if (schemaName === 'customer') return SERVICE.DefaultCustomerService;
        return undefined;
    },
    /** Validates a create/upsert-save payload without misclassifying an idempotency query as an update. */
    validateSave: function (request) {
        return this.validate(request, 'save');
    },
    /** Validates a partial update against its required persisted principal. */
    validateUpdate: function (request) {
        return this.validate(request, 'update');
    },
    /** Validates principal type, service groups, credentials, and active group references. */
    validate: function (request, operation) {
        let updates = this.normalizeModels(request.model);
        let service = operation === 'update' && request.query && this.getPrincipalService(request);
        let load = service ? service.get({ tenant: request.tenant, authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(), query: request.query, options: { recursive: false } }) : Promise.resolve({ result: [] });
        return load.then(result => {
            let existing = result && result.result || [];
            if (service && existing.length === 0) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Principal update requires an existing record');
            let models = service ? existing.map(principal => this.applyUpdate(principal, updates[0])) : updates.map(update => this.applyUpdate({}, update));
            this.validateModels(models);
            let requestedGroups = Array.from(new Set(models.reduce((groups, model) => groups.concat(model.userGroups || []), [])));
            if (requestedGroups.length === 0) return true;
            return SERVICE.DefaultUserGroupService.get({
                tenant: request.tenant,
                authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                options: { recursive: false }, query: { code: { $in: requestedGroups }, active: true }
            }).then(groupResult => {
                let activeGroups = (groupResult && groupResult.result || []).map(group => group.code);
                let missing = requestedGroups.filter(group => !activeGroups.includes(group));
                if (missing.length > 0) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Unknown or inactive user groups: ' + missing.join(', '));
                return true;
            });
        });
    }
};
