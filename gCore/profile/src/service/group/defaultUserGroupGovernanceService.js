/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/service/group/DefaultUserGroupGovernanceService
 * @description Validates active user-group inheritance, permission catalog membership, and acyclic group graphs before persistence.
 * @layer service
 * @owner profile
 * @override Project modules may extend the permission catalog and graph policy through later layers.
 */
module.exports = {
    /** Normalizes referenced parent-group codes. */
    normalizeParents: function (parents) {
        return (parents || []).map(parent => UTILS.isObject(parent) ? parent.code : parent).filter(Boolean);
    },
    /** Normalizes update operators into validation models. */
    normalizeModels: function (model) {
        return Array.isArray(model) ? model : [model || {}];
    },
    /** Applies update operators to a persisted group for effective-state validation. */
    applyUpdate: function (existing, update) {
        let effective = Object.assign({}, existing || {});
        Object.keys(update || {}).filter(key => !key.startsWith('$')).forEach(key => { effective[key] = update[key]; });
        Object.assign(effective, update && update.$set || {});
        Object.keys(update && update.$unset || {}).forEach(key => { delete effective[key]; });
        return effective;
    },
    /** Rejects permissions absent from the effective catalog. */
    validatePermissions: function (models) {
        let catalog = CONFIG.get('identityGovernance') && CONFIG.get('identityGovernance').permissionCatalog || [];
        models.forEach(model => (model.permissions || []).forEach(permission => {
            if (!catalog.includes(permission)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Unknown permission code: ' + permission);
        }));
    },
    /** Validates parent existence, activity, and graph acyclicity. */
    validateGraph: function (models, existingGroups) {
        let graph = {}, active = {};
        (existingGroups || []).concat(models).forEach(group => {
            if (!group || !group.code) return;
            graph[group.code] = this.normalizeParents(group.parentGroups);
            active[group.code] = group.active !== false;
        });
        Object.keys(graph).forEach(code => graph[code].forEach(parent => {
            if (parent === code) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'User group cannot inherit itself: ' + code);
            if (!Object.prototype.hasOwnProperty.call(graph, parent)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Unknown parent user group: ' + parent);
            if (active[parent] === false) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Inactive parent user group: ' + parent);
        }));
        let visiting = new Set(), visited = new Set();
        let visit = code => {
            if (visiting.has(code)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Cyclic user-group inheritance detected at: ' + code);
            if (visited.has(code)) return;
            visiting.add(code);
            (graph[code] || []).forEach(visit);
            visiting.delete(code);
            visited.add(code);
        };
        Object.keys(graph).forEach(visit);
    },
    /** Runs complete group governance for save and update requests. */
    validate: function (request) {
        let updates = this.normalizeModels(request.model);
        let queryCode = request.query && request.query.code;
        let governance = CONFIG.get('identityGovernance') || {};
        return SERVICE.DefaultUserGroupService.get({
            tenant: request.tenant,
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            options: { recursive: false },
            query: {},
            searchOptions: {
                pageSize: governance.groupValidationPageSize || 10000,
                pageNumber: 1
            }
        }).then(result => {
            let existingGroups = result && result.result || [];
            let models = updates.map(update => {
                let code = update.code || update.$set && update.$set.code || queryCode;
                let existing = existingGroups.find(group => group.code === code);
                return this.applyUpdate(existing, Object.assign({}, update, code ? { code: code } : {}));
            });
            this.validatePermissions(models);
            this.validateGraph(models, existingGroups);
            return true;
        });
    }
};
