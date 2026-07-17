/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/service/access/DefaultRecordOwnershipPolicyService
 * @description Applies schema-declared record ownership constraints to the
 * existing generated CRUD request before persistence. Later modules may
 * override this service or schema ownership metadata without changing core.
 */
module.exports = {
    /** Returns ownership metadata from the effective layered schema. */
    getPolicy: function (request) {
        return request.schemaModel && request.schemaModel.rawSchema && request.schemaModel.rawSchema.ownership || {};
    },
    /** Resolves the stable authenticated principal identifier. */
    getActor: function (authData) {
        authData = authData || {};
        return authData.loginId || authData.serviceId || authData.sub || authData.code || authData.userId || authData.uid || authData.email;
    },
    /** Determines whether trusted system or configured groups bypass ownership. */
    shouldBypass: function (request, policy) {
        let authData = request.authData || request.autData || {};
        if (authData.isSystem === true) return true;
        let groups = [].concat(authData.userGroups || []);
        return groups.some(group => (policy.bypassGroups || []).includes(group));
    },
    /** Determines whether ownership applies to the current principal and schema. */
    isApplicable: function (request, policy) {
        if (policy.enabled !== true || this.shouldBypass(request, policy)) return false;
        let authData = request.authData || request.autData || {};
        if (!policy.principalTypes || policy.principalTypes.length === 0) return true;
        let groups = [].concat(authData.userGroups || []);
        if ((policy.subjectGroups || []).some(group => groups.includes(group))) return true;
        return Boolean(authData.principalType && policy.principalTypes.includes(authData.principalType));
    },
    /**
     * Applies create attribution or owner-scoped query constraints.
     * @returns {Promise<boolean>} Resolves when the request is safely constrained.
     */
    enforce: function (request, operation) {
        try {
            let policy = this.getPolicy(request);
            if (!this.isApplicable(request, policy)) return Promise.resolve(true);
            let authData = request.authData || request.autData || {};
            let actor = this.getActor(authData);
            if (!actor) return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Authenticated principal is required for owned records'));
            let ownerProperty = policy.ownerProperty || 'ownerId';
            if (operation === 'create') {
                let models = request.models || [request.model];
                models.filter(Boolean).forEach(model => {
                    if (model[ownerProperty] && model[ownerProperty] !== actor) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Record ownership cannot be assigned to another principal');
                    model[ownerProperty] = actor;
                    model.ownerType = authData.principalType;
                    model.createdBy = actor;
                    model.updatedBy = actor;
                });
            } else {
                if (operation === 'remove' && (!request.query || Object.keys(request.query).length === 0)) {
                    if (request.codes && request.codes.length > 0) request.query = { code: { $in: request.codes } };
                    else if (request.ids && request.ids.length > 0) request.query = { _id: { $in: request.ids.map(id => SERVICE.DefaultDatabaseConfigurationService.toObjectId(request.schemaModel, id)) } };
                }
                request.query = Object.assign({}, request.query || {}, { [ownerProperty]: actor });
                if (operation === 'update') {
                    request.model = request.model || {};
                    delete request.model[ownerProperty];
                    if (request.model.$set) {
                        request.model.$set.updatedBy = actor;
                        delete request.model.$set[ownerProperty];
                    } else {
                        request.model.updatedBy = actor;
                    }
                    if (request.model.$unset) delete request.model.$unset[ownerProperty];
                }
            }
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }
};
