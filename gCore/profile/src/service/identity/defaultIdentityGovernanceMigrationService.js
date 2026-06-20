/**
 * @module profile/service/identity/DefaultIdentityGovernanceMigrationService
 * @description Provides tenant-scoped preview, apply, audit, rollback, ownership backfill, and recoverable service-key rotation for identity governance upgrades.
 * @layer service
 * @owner profile
 * @override Project modules may override migration policy and persistence while preserving preview safety, credential redaction, and change-set rollback.
 */
module.exports = {
    /** Returns the effective layered identity migration policy. */
    getPolicy: function () {
        return CONFIG.get('identityGovernance').migration || {};
    },
    /** Resolves the tenant receiving migration operations. */
    getTenant: function (request) {
        return request.tenant || CONFIG.get('defaultTenant') || 'default';
    },
    /** Resolves the authenticated governance actor. */
    getActor: function (request) {
        let authData = request.authData || request.autData || {};
        return authData.loginId || authData.serviceId || authData.code || authData.userId || authData.uid || authData.email;
    },
    /** Creates a trusted generated-service request scoped to the migration tenant. */
    systemRequest: function (request, additions) {
        return Object.assign({
            tenant: this.getTenant(request),
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            options: { recursive: false }
        }, additions || {});
    },
    /** Loads groups, principals, and owned profile resources without recursive population. */
    loadState: function (request) {
        return Promise.all([
            SERVICE.DefaultUserGroupService.get(this.systemRequest(request, { query: {} })),
            SERVICE.DefaultEmployeeService.get(this.systemRequest(request, { query: {} })),
            SERVICE.DefaultCustomerService.get(this.systemRequest(request, { query: {} })),
            SERVICE.DefaultAddressService.get(this.systemRequest(request, { query: {} })),
            SERVICE.DefaultContactService.get(this.systemRequest(request, { query: {} }))
        ]).then(results => ({
            groups: results[0].result || [],
            employees: results[1].result || [],
            customers: results[2].result || [],
            addresses: results[3].result || [],
            contacts: results[4].result || []
        }));
    },
    /** Removes credential material from a principal audit snapshot. */
    sanitizePrincipal: function (principal) {
        return {
            code: principal.code,
            loginId: principal.loginId,
            principalType: principal.principalType,
            userGroups: [].concat(principal.userGroups || []),
            identityMigrationVersion: principal.identityMigrationVersion,
            ownerId: principal.ownerId,
            ownerType: principal.ownerType,
            createdBy: principal.createdBy,
            updatedBy: principal.updatedBy,
            apiKeyStatus: principal.apiKey || principal.apiKeyHash ? (principal.apiKeyStatus || 'active') : principal.apiKeyStatus,
            hadApiKey: Boolean(principal.apiKey || principal.apiKeyHash),
            hadLegacyPlaintextAPIKey: Boolean(principal.apiKey)
        };
    },
    /** Captures only the structural records present in the preview change set. */
    snapshot: function (preview) {
        return {
            changes: preview.changes.map(change => ({ schema: change.schema, code: change.code, from: change.from }))
        };
    },
    /** Computes a safe target without downgrading custom service principals. */
    targetPrincipal: function (principal, type) {
        let policy = this.getPolicy();
        let configuredService = type === 'employee' && (policy.servicePrincipalCodes || []).includes(principal.code);
        let isService = type === 'employee' && (configuredService || principal.principalType === 'service' || (principal.userGroups || []).includes(policy.serviceGroup));
        let isAdmin = type === 'employee' && (policy.administratorCodes || []).includes(principal.code);
        let serviceGroups = configuredService ? [policy.serviceGroup] : Array.from(new Set([].concat(principal.userGroups || [], policy.serviceGroup).filter(Boolean)));
        return {
            principalType: type === 'customer' ? 'customer' : (isService ? 'service' : 'human'),
            userGroups: type === 'customer' ? [policy.customerGroup] : (isService ? serviceGroups : (isAdmin ? policy.administratorGroups : (principal.userGroups && principal.userGroups.length ? principal.userGroups.filter(group => group !== policy.serviceGroup) : [policy.humanDefaultGroup]))),
            revokeAPIKey: !isService && Boolean(principal.apiKey),
            rotationRequired: isService && (Boolean(principal.apiKey) || !principal.apiKeyHash || principal.identityMigrationVersion !== (policy.version || 1)),
            revokeLegacyAPIKey: isService && Boolean(principal.apiKey),
            ownerId: type === 'customer' ? principal.loginId : principal.ownerId,
            ownerType: type === 'customer' ? 'customer' : principal.ownerType,
            createdBy: type === 'customer' ? (principal.createdBy || principal.loginId) : principal.createdBy,
            updatedBy: type === 'customer' ? principal.loginId : principal.updatedBy,
            identityMigrationVersion: policy.version || 1
        };
    },
    /** Builds address and contact ownership backfill changes from customer references. */
    buildOwnedResourceChanges: function (state) {
        let changes = [], ownership = { address: {}, contact: {} };
        state.customers.forEach(customer => {
            [['address', customer.addresses || []], ['contact', customer.contacts || []]].forEach(entry => entry[1].forEach(code => {
                let existing = ownership[entry[0]][code];
                if (existing && existing !== customer.loginId) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Shared customer-owned resource requires explicit ownership resolution: ' + entry[0] + ':' + code);
                ownership[entry[0]][code] = customer.loginId;
            }));
        });
        [['address', state.addresses || []], ['contact', state.contacts || []]].forEach(entry => entry[1].forEach(record => {
            let ownerId = ownership[entry[0]][record.code];
            if (!ownerId || (record.ownerId === ownerId && record.ownerType === 'customer')) return;
            changes.push({
                schema: entry[0], code: record.code,
                from: { code: record.code, ownerId: record.ownerId, ownerType: record.ownerType, createdBy: record.createdBy, updatedBy: record.updatedBy },
                to: { ownerId: ownerId, ownerType: 'customer', createdBy: record.createdBy || ownerId, updatedBy: ownerId }
            });
        }));
        return changes;
    },
    /** Builds the complete idempotent migration change set. */
    buildPreview: function (state) {
        let changes = [], serviceKeyRotationsRequired = [];
        let groupTargets = this.getPolicy().groupTargets || {};
        state.groups.forEach(group => {
            let target = groupTargets[group.code];
            if (!target) return;
            let parentsChanged = JSON.stringify(group.parentGroups || []) !== JSON.stringify(target.parentGroups || []);
            let permissionsChanged = target.permissions && JSON.stringify(group.permissions || []) !== JSON.stringify(target.permissions);
            if (parentsChanged || permissionsChanged) changes.push({ schema: 'userGroup', code: group.code, from: { code: group.code, parentGroups: [].concat(group.parentGroups || []), permissions: [].concat(group.permissions || []) }, to: target });
        });
        changes = changes.concat(this.buildOwnedResourceChanges(state));
        state.employees.forEach(principal => {
            let target = this.targetPrincipal(principal, 'employee');
            if (target.rotationRequired) serviceKeyRotationsRequired.push(principal.code);
            let rotationStateChanged = target.rotationRequired && principal.apiKeyStatus !== 'rotation_required';
            if (principal.principalType !== target.principalType || JSON.stringify(principal.userGroups || []) !== JSON.stringify(target.userGroups) || principal.identityMigrationVersion !== target.identityMigrationVersion || target.revokeAPIKey || target.revokeLegacyAPIKey || rotationStateChanged) {
                changes.push({ schema: 'employee', code: principal.code, from: this.sanitizePrincipal(principal), to: target });
            }
        });
        state.customers.forEach(principal => {
            let target = this.targetPrincipal(principal, 'customer');
            if (principal.principalType !== target.principalType || JSON.stringify(principal.userGroups || []) !== JSON.stringify(target.userGroups) || principal.identityMigrationVersion !== target.identityMigrationVersion || principal.ownerId !== target.ownerId || principal.ownerType !== target.ownerType || target.revokeAPIKey) {
                changes.push({ schema: 'customer', code: principal.code, from: this.sanitizePrincipal(principal), to: target });
            }
        });
        return { migrationVersion: this.getPolicy().version || 1, changes: changes, changeCount: changes.length, serviceKeyRotationsRequired: serviceKeyRotationsRequired, idempotent: changes.length === 0 };
    },
    /** Returns a non-mutating migration preview response. */
    previewMigration: function (request) {
        return this.loadState(request).then(state => ({ code: 'SUC_SYS_00000', data: this.buildPreview(state) }));
    },
    /** Applies one structural migration change without generating secrets. */
    updatePrincipal: function (request, change) {
        let target = change.to;
        if (change.schema === 'userGroup') {
            return SERVICE.DefaultUserGroupService.update(this.systemRequest(request, { query: { code: change.code }, model: { $set: target } }));
        }
        if (change.schema === 'address' || change.schema === 'contact') {
            let ownedService = change.schema === 'address' ? SERVICE.DefaultAddressService : SERVICE.DefaultContactService;
            return ownedService.update(this.systemRequest(request, { query: { code: change.code }, model: { $set: target } }));
        }
        let model = { $set: {
            principalType: target.principalType,
            userGroups: target.userGroups,
            identityMigrationVersion: target.identityMigrationVersion,
            ownerId: target.ownerId,
            ownerType: target.ownerType,
            createdBy: target.createdBy,
            updatedBy: target.updatedBy
        } };
        if (target.revokeAPIKey || target.revokeLegacyAPIKey || target.rotationRequired) {
            Object.assign(model.$set, { apiKeyStatus: target.rotationRequired ? 'rotation_required' : 'revoked', apiKeyExpiresAt: new Date() });
            model.$unset = { apiKey: 1 };
        }
        let service = change.schema === 'employee' ? SERVICE.DefaultEmployeeService : SERVICE.DefaultCustomerService;
        return service.update(this.systemRequest(request, { query: { code: change.code, loginId: change.from.loginId }, model: model }));
    },
    /** Persists a redacted identity governance audit record. */
    saveAudit: function (request, model) {
        return SERVICE.DefaultIdentityMigrationAuditService.save(this.systemRequest(request, { model: model }));
    },
    /** Builds set/unset operators that accurately restore absent fields. */
    buildRestoreModel: function (source, properties) {
        let set = {}, unset = {};
        properties.forEach(property => source[property] === undefined ? unset[property] = 1 : set[property] = source[property]);
        let model = {};
        if (Object.keys(set).length > 0) model.$set = set;
        if (Object.keys(unset).length > 0) model.$unset = unset;
        return model;
    },
    /** Applies the versioned migration and reports pending credential rotations. */
    applyMigration: function (request) {
        return this.loadState(request).then(state => {
            let preview = this.buildPreview(state);
            let auditCode = 'identityMigration_' + this.getTenant(request) + '_' + Date.now();
            let audit = { code: auditCode, active: true, migrationVersion: preview.migrationVersion, status: 'APPLYING', tenant: this.getTenant(request), requestedBy: this.getActor(request), preview: preview, snapshot: this.snapshot(preview), correlationId: request.correlationId };
            return this.saveAudit(request, audit).then(() => {
                return preview.changes.reduce((promise, change) => promise.then(() => this.updatePrincipal(request, change)), Promise.resolve()).then(() => {
                    audit.status = preview.idempotent ? 'NO_CHANGES' : 'APPLIED';
                    audit.result = { changed: preview.changeCount, credentialsRevoked: preview.changes.filter(change => change.to.revokeAPIKey || change.to.revokeLegacyAPIKey).length, serviceKeyRotationsRequired: preview.serviceKeyRotationsRequired };
                    return SERVICE.DefaultIdentityMigrationAuditService.update(this.systemRequest(request, { query: { code: auditCode }, model: { $set: { status: audit.status, result: audit.result } } })).then(() => ({ code: 'SUC_SYS_00000', data: audit }));
                }).catch(error => {
                    let failure = { code: error.code || 'ERR_AUTH_00000', message: 'Identity migration failed; inspect correlated server diagnostics' };
                    return SERVICE.DefaultIdentityMigrationAuditService.update(this.systemRequest(request, { query: { code: auditCode }, model: { $set: { status: 'FAILED', result: { failure: failure } } } })).catch(() => false).then(() => { throw error; });
                });
            });
        });
    },
    /** Restores only records present in the audited change set. */
    rollbackMigration: function (request) {
        let payload = request.identityMigration || {};
        if (!payload.auditCode) return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'auditCode is required for identity migration rollback'));
        return SERVICE.DefaultIdentityMigrationAuditService.get(this.systemRequest(request, { query: { code: payload.auditCode } })).then(result => {
            let audit = result.result && result.result[0];
            if (!audit || !audit.preview || !Array.isArray(audit.preview.changes)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Identity migration audit change set was not found');
            if (audit.status === 'ROLLED_BACK') return { code: 'SUC_SYS_00000', data: { auditCode: payload.auditCode, status: 'ROLLED_BACK', credentialsRestored: false, idempotent: true } };
            let changes = audit.preview.changes;
            return changes.reduce((promise, change) => promise.then(() => {
                let item = change.from || {};
                if (change.schema === 'userGroup') return SERVICE.DefaultUserGroupService.update(this.systemRequest(request, { query: { code: change.code }, model: { $set: { parentGroups: item.parentGroups, permissions: item.permissions } } }));
                if (change.schema === 'address' || change.schema === 'contact') {
                    let service = change.schema === 'address' ? SERVICE.DefaultAddressService : SERVICE.DefaultContactService;
                    return service.update(this.systemRequest(request, { query: { code: change.code }, model: this.buildRestoreModel(item, ['ownerId', 'ownerType', 'createdBy', 'updatedBy']) }));
                }
                let service = change.schema === 'customer' ? SERVICE.DefaultCustomerService : SERVICE.DefaultEmployeeService;
                let model = this.buildRestoreModel(item, ['principalType', 'userGroups', 'identityMigrationVersion', 'ownerId', 'ownerType', 'createdBy', 'updatedBy', 'apiKeyStatus']);
                if (change.to && (change.to.revokeAPIKey || change.to.revokeLegacyAPIKey)) {
                    model.$set = model.$set || {};
                    model.$set.apiKeyStatus = 'revoked';
                    model.$unset = Object.assign({}, model.$unset || {}, { apiKey: 1 });
                }
                return service.update(this.systemRequest(request, { query: { code: change.code, loginId: item.loginId }, model: model }));
            }), Promise.resolve()).then(() => SERVICE.DefaultIdentityMigrationAuditService.update(this.systemRequest(request, { query: { code: payload.auditCode }, model: { $set: { status: 'ROLLED_BACK', result: { credentialsRestored: false, principalsRestored: changes.length } } } }))).then(() => ({ code: 'SUC_SYS_00000', data: { auditCode: payload.auditCode, status: 'ROLLED_BACK', credentialsRestored: false } }));
        });
    },
    /** Activates a client-generated replacement key for a verified service principal. */
    rotateServiceKey: function (request) {
        let payload = request.identityMigration || {};
        if (!payload.principalCode || typeof payload.newApiKey !== 'string' || payload.newApiKey.length < 32) return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'principalCode and a client-generated API key of at least 32 characters are required'));
        return SERVICE.DefaultEmployeeService.get(this.systemRequest(request, { query: { code: payload.principalCode } })).then(result => {
            let principal = result.result && result.result[0];
            let policy = this.getPolicy();
            if (!principal || (principal.principalType !== 'service' && !(principal.userGroups || []).includes(policy.serviceGroup))) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'API keys may only be rotated for service principals');
            let keyPolicy = CONFIG.get('authSecurity').apiKey || {};
            let credential = SERVICE.DefaultAPIKeyCredentialService.prepare(payload.newApiKey);
            let configuredScopes = policy.servicePrincipalScopes && policy.servicePrincipalScopes[principal.code] || [];
            let scopes = Array.from(new Set([].concat(payload.apiKeyScopes || principal.apiKeyScopes || configuredScopes).filter(Boolean)));
            let permissionCatalog = CONFIG.get('identityGovernance').permissionCatalog || [];
            let invalidScopes = scopes.filter(scope => !permissionCatalog.includes(scope));
            if (invalidScopes.length > 0) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'API-key scopes are not present in the identity permission catalog: ' + invalidScopes.join(', '));
            if (keyPolicy.requireScopes === true && scopes.length === 0) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'At least one governed API-key scope is required');
            credential.apiKeyScopes = scopes;
            if (keyPolicy.defaultLifetimeSeconds) credential.apiKeyExpiresAt = new Date(Date.now() + keyPolicy.defaultLifetimeSeconds * 1000);
            return SERVICE.DefaultEmployeeService.update(this.systemRequest(request, {
                query: { code: principal.code, loginId: principal.loginId },
                model: { $set: Object.assign({ principalType: principal.principalType, userGroups: principal.userGroups }, credential), $unset: { apiKey: 1 } }
            })).then(() => this.saveAudit(request, {
                code: 'serviceKeyRotation_' + this.getTenant(request) + '_' + Date.now(), active: true,
                migrationVersion: policy.version || 1, status: 'CREDENTIAL_ROTATED', tenant: this.getTenant(request),
                requestedBy: this.getActor(request), result: { principalCode: principal.code }, correlationId: request.correlationId
            })).then(() => ({ code: 'SUC_SYS_00000', data: { principalCode: principal.code, status: 'CREDENTIAL_ROTATED' } }));
        });
    }
};
