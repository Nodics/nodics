/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/service/identity/DefaultMandatoryIdentityBootstrapService
 * @description Reconciles missing, non-secret identity-governance groups after init data is available. Existing records are never overwritten automatically, preserving project and tenant customizations while allowing safe framework upgrades.
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

    /**
     * Creates only missing configured groups and records the resulting startup change.
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
            const save = models.length > 0 ? SERVICE.DefaultUserGroupService.saveAll(this.systemRequest(request, { models: models })) : Promise.resolve(true);
            return save.then(() => this.recordAudit(request, creationOrder)).then(() => ({
                status: creationOrder.length > 0 ? 'RECONCILED' : 'NO_CHANGES',
                createdGroups: creationOrder
            }));
        });
    },

    /** Persists a sanitized audit entry when startup creates mandatory groups. */
    recordAudit: function (request, createdGroups) {
        if (createdGroups.length === 0) return Promise.resolve(true);
        return SERVICE.DefaultIdentityMigrationAuditService.save(this.systemRequest(request, {
            model: {
                code: 'mandatoryIdentityBootstrap_' + (request.tenant || 'default') + '_' + Date.now(),
                active: true,
                migrationVersion: this.getPolicy().version || 1,
                status: 'BOOTSTRAP_RECONCILED',
                tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
                requestedBy: 'nodics-startup',
                result: { createdGroups: createdGroups },
                correlationId: request.correlationId
            }
        }));
    }
};
