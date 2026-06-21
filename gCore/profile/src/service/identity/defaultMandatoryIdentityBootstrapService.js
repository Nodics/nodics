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
        return SERVICE.DefaultUserGroupService.get(this.systemRequest(request, { query: {} })).then(response => {
            const existingCodes = new Set((response.result || []).map(group => group.code));
            const createdGroups = [];
            const creationOrder = this.orderMissingGroups(targets, existingCodes);
            return creationOrder.reduce((promise, code) => promise.then(() => {
                const model = Object.assign({ code: code, name: code, active: true }, targets[code]);
                return SERVICE.DefaultUserGroupService.save(this.systemRequest(request, { model: model })).then(() => {
                    existingCodes.add(code);
                    createdGroups.push(code);
                    return true;
                });
            }), Promise.resolve()).then(() => this.recordAudit(request, createdGroups)).then(() => ({
                status: createdGroups.length > 0 ? 'RECONCILED' : 'NO_CHANGES',
                createdGroups: createdGroups
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
