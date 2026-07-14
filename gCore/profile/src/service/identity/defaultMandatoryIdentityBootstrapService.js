/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/service/identity/DefaultMandatoryIdentityBootstrapService
 * @description Reconciles missing, non-secret identity-governance groups and configured service-principal metadata after init data is available. Credential values are never generated, rotated, or overwritten automatically, preserving project and tenant secrets while allowing safe framework upgrades.
 * @layer service
 * @owner profile
 * @override Projects may replace this service or the configured mandatory-bootstrap service list while preserving idempotency, auditability, and fail-closed identity startup.
 */
module.exports = {
    /** Returns the effective layered migration policy. */
    getPolicy: function () {
        return CONFIG.get('identityGovernance') && CONFIG.get('identityGovernance').migration || {};
    },

    /** Builds a trusted, tenant-scoped generated-service request. */
    systemRequest: function (request, additions) {
        return Object.assign({
            tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            options: { recursive: false }
        }, additions || {});
    },

    /** Orders missing groups so configured parent groups are created before their children. */
    orderMissingGroups: function (targets, existingCodes) {
        const available = new Set(existingCodes);
        const pending = Object.keys(targets).filter(code => !available.has(code));
        const ordered = [];
        while (pending.length > 0) {
            const readyIndex = pending.findIndex(code => [].concat(targets[code].parentGroups || []).every(parent => available.has(parent)));
            if (readyIndex < 0) {
                throw new Error('Mandatory identity groups contain unresolved or cyclic parents: ' + pending.join(', '));
            }
            const code = pending.splice(readyIndex, 1)[0];
            ordered.push(code);
            available.add(code);
        }
        return ordered;
    },

    /** Builds a bounded query for only the configured mandatory groups. */
    buildMandatoryGroupLookup: function (targets) {
        const codes = Object.keys(targets || {});
        return {
            query: codes.length > 0 ? { code: { $in: codes } } : { code: { $in: [] } },
            searchOptions: {
                pageSize: Math.max(codes.length, 1),
                pageNumber: 1
            }
        };
    },

    /** Saves missing mandatory groups as per-code upserts so startup remains idempotent on partially seeded databases. */
    saveMissingGroups: function (request, models) {
        return models.reduce((promise, model) => promise.then(createdGroups => {
            return SERVICE.DefaultUserGroupService.save(this.systemRequest(request, {
                query: { code: model.code },
                model: model
            })).then(response => {
                if (response && response.errors && response.errors.length > 0) {
                    throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Mandatory identity group could not be reconciled: ' + model.code);
                }
                return createdGroups.concat(model.code);
            });
        }), Promise.resolve([]));
    },

    /** Builds a bounded query for only configured service principals. */
    buildServicePrincipalLookup: function (policy) {
        const codes = [].concat(policy.servicePrincipalCodes || []);
        return {
            query: codes.length > 0 ? { code: { $in: codes } } : { code: { $in: [] } },
            searchOptions: {
                pageSize: Math.max(codes.length, 1),
                pageNumber: 1
            }
        };
    },

    /** Builds a non-secret metadata update for an existing configured service principal. */
    buildServicePrincipalUpdate: function (principal, policy) {
        const serviceGroup = policy.serviceGroup;
        const configuredScopes = policy.servicePrincipalScopes && policy.servicePrincipalScopes[principal.code] || [];
        const codeOf = item => item && typeof item === 'object' ? item.code : item;
        const sameSet = (left, right) => {
            const leftSet = new Set([].concat(left || []).map(codeOf).filter(Boolean));
            const rightSet = new Set([].concat(right || []).map(codeOf).filter(Boolean));
            return leftSet.size === rightSet.size && Array.from(leftSet).every(item => rightSet.has(item));
        };
        const target = {
            principalType: 'service',
            userGroups: serviceGroup ? [serviceGroup] : [].concat(principal.userGroups || []),
            apiKeyScopes: Array.from(new Set([].concat(principal.apiKeyScopes || [], configuredScopes).filter(Boolean))),
            identityMigrationVersion: policy.version || 1
        };
        if ((principal.apiKey || principal.apiKeyHash) && !principal.apiKeyStatus) {
            target.apiKeyStatus = 'active';
        }
        const checks = {
            principalType: principal.principalType !== target.principalType,
            userGroups: !sameSet(principal.userGroups, target.userGroups),
            apiKeyScopes: !sameSet(principal.apiKeyScopes, target.apiKeyScopes),
            identityMigrationVersion: principal.identityMigrationVersion !== target.identityMigrationVersion,
            apiKeyStatus: Boolean(target.apiKeyStatus && principal.apiKeyStatus !== target.apiKeyStatus)
        };
        const changed = Object.keys(checks).some(key => checks[key]);
        return changed ? target : null;
    },

    /** Reconciles existing configured service principals without touching credential material. */
    reconcileServicePrincipals: function (request, policy) {
        const lookup = this.buildServicePrincipalLookup(policy);
        const configuredCodes = new Set([].concat(policy.servicePrincipalCodes || []));
        if (configuredCodes.size === 0) return Promise.resolve([]);
        return SERVICE.DefaultEmployeeService.get(this.systemRequest(request, lookup)).then(response => {
            const principals = (response.result || []).filter(principal => configuredCodes.has(principal.code));
            return principals.reduce((promise, principal) => promise.then(reconciled => {
                const target = this.buildServicePrincipalUpdate(principal, policy);
                if (!target) return reconciled;
                return SERVICE.DefaultEmployeeService.update(this.systemRequest(request, {
                    query: { code: principal.code },
                    model: target
                })).then(() => reconciled.concat(principal.code));
            }), Promise.resolve([]));
        });
    },

    /**
     * Creates only missing configured groups, reconciles configured service principals, and records the resulting startup change.
     *
     * @param {Object} request Bootstrap tenant and trace context.
     * @returns {Promise<Object>} Idempotent reconciliation summary.
     */
    reconcile: function (request) {
        const policy = this.getPolicy();
        if (policy.reconcileMissingGroupsOnStartup === false) {
            return Promise.resolve({ status: 'DISABLED', createdGroups: [] });
        }
        const targets = policy.groupTargets || {};
        const lookup = this.buildMandatoryGroupLookup(targets);
        return SERVICE.DefaultUserGroupService.get(this.systemRequest(request, lookup)).then(response => {
            const existingCodes = new Set((response.result || []).map(group => group.code));
            const creationOrder = this.orderMissingGroups(targets, existingCodes);
            const models = creationOrder.map(code => Object.assign({ code: code, name: code, active: true }, targets[code]));
            const save = models.length > 0 ? this.saveMissingGroups(request, models) : Promise.resolve([]);
            return save.then(createdGroups => this.reconcileServicePrincipals(request, policy).then(reconciledServicePrincipals => {
                return this.recordAudit(request, createdGroups, reconciledServicePrincipals).then(() => ({
                    status: createdGroups.length > 0 || reconciledServicePrincipals.length > 0 ? 'RECONCILED' : 'NO_CHANGES',
                    createdGroups: createdGroups,
                    reconciledServicePrincipals: reconciledServicePrincipals
                }));
            }));
        });
    },

    /** Persists a sanitized audit entry when startup creates mandatory groups or reconciles service-principal metadata. */
    recordAudit: function (request, createdGroups, reconciledServicePrincipals) {
        if (createdGroups.length === 0 && reconciledServicePrincipals.length === 0) return Promise.resolve(true);
        return SERVICE.DefaultIdentityMigrationAuditService.save(this.systemRequest(request, {
            model: {
                code: 'mandatoryIdentityBootstrap_' + (request.tenant || 'default') + '_' + Date.now(),
                active: true,
                migrationVersion: this.getPolicy().version || 1,
                status: 'BOOTSTRAP_RECONCILED',
                tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
                requestedBy: 'nodics-startup',
                result: { createdGroups: createdGroups, reconciledServicePrincipals: reconciledServicePrincipals },
                correlationId: request.correlationId
            }
        }));
    }
};
