/**
 * @module profile/service/identity/DefaultPrincipalSecurityStampGovernanceService
 * @description Advances principal security stamps for direct principal, password, and group-membership changes.
 * @layer service
 * @owner profile
 * @override Project modules may replace stamp propagation with an external IAM invalidation mechanism.
 */
module.exports = {
    /** Returns a locally monotonic stamp candidate. */
    nextVersion: function () {
        this._lastVersion = Math.max(Date.now(), (this._lastVersion || 0) + 1);
        return this._lastVersion;
    },
    /** Resolves the generated principal service for the effective schema. */
    getPrincipalService: function (request) {
        let schemaName = request.schemaModel && request.schemaModel.schemaName;
        if (schemaName === 'employee') return SERVICE.DefaultEmployeeService;
        if (schemaName === 'customer') return SERVICE.DefaultCustomerService;
        return undefined;
    },
    /** Resolves every persisted principal affected by the update query and prepares one new stamp. */
    preparePrincipalUpdate: function (request) {
        request.model = request.model || {};
        let service = this.getPrincipalService(request);
        if (!service) return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Principal schema could not be resolved for security-stamp update'));
        return service.get({
            tenant: request.tenant,
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            query: request.query || {},
            options: { recursive: false }
        }).then(result => {
            let principals = result && result.result || [];
            if (principals.length === 0) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Security-stamp update requires an existing principal');
            request.securityStampTargets = principals.map(principal => principal.loginId).filter(Boolean);
            if (request.securityStampTargets.length !== principals.length) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Every security-stamp target requires a stable loginId');
            let version = this.nextVersion();
            if (request.model.$set) request.model.$set.authVersion = version;
            else request.model.authVersion = version;
            request.securityStampVersion = version;
            return true;
        });
    },
    /** Registers prepared principal stamps only after persistence succeeds. */
    registerPreparedPrincipalUpdate: function (request) {
        let targets = request.securityStampTargets || [];
        let version = request.securityStampVersion;
        if (targets.length === 0 || version === undefined) return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Prepared security-stamp targets are required after principal update'));
        return targets.reduce((promise, principalId) => promise.then(() =>
            SERVICE.DefaultPrincipalSecurityStampService.register(request.tenant, principalId, version)
        ), Promise.resolve()).then(() => true);
    },
    /** Advances and registers a principal when the stable identifier is already known. */
    bumpPrincipal: function (request) {
        let model = request.model && (request.model.$set || request.model) || {};
        let principalId = model.loginId || request.query && request.query.loginId;
        if (!principalId) return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Stable principal loginId is required for security-stamp update'));
        let version = model.authVersion || this.nextVersion();
        if (request.model.$set) request.model.$set.authVersion = version;
        else request.model.authVersion = version;
        return SERVICE.DefaultPrincipalSecurityStampService.register(request.tenant, principalId, version).then(() => true);
    },
    /** Resolves one password owner and advances only that principal. */
    bumpLoginId: function (request) {
        let model = request.model && (request.model.$set || request.model) || {};
        let loginId = model.loginId || request.query && request.query.loginId;
        if (!loginId) return Promise.resolve(true);
        let system = SERVICE.DefaultIdentityGovernanceService.getSystemAuthData();
        let find = service => service.get({ tenant: request.tenant, authData: system, query: { loginId: loginId }, options: { recursive: false } });
        return Promise.all([find(SERVICE.DefaultEmployeeService), find(SERVICE.DefaultCustomerService)]).then(results => {
            let matches = [];
            (results[0].result || []).forEach(principal => matches.push({ service: SERVICE.DefaultEmployeeService, principal: principal }));
            (results[1].result || []).forEach(principal => matches.push({ service: SERVICE.DefaultCustomerService, principal: principal }));
            if (matches.length !== 1) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Password owner must resolve to exactly one principal');
            let match = matches[0];
            return match.service.update({ tenant: request.tenant, authData: system, query: { loginId: match.principal.loginId }, model: { $set: { authVersion: this.nextVersion() } } });
        }).then(() => true);
    },
    /** Returns the changed group and every group inheriting from it. */
    getAffectedGroupCodes: function (groups, changedCode) {
        let affected = new Set([changedCode]);
        let changed = true;
        while (changed) {
            changed = false;
            (groups || []).forEach(group => {
                let parents = (group.parentGroups || []).map(parent => UTILS.isObject(parent) ? parent.code : parent);
                if (!affected.has(group.code) && parents.some(parent => affected.has(parent))) {
                    affected.add(group.code);
                    changed = true;
                }
            });
        }
        return Array.from(affected);
    },
    /** Advances every principal affected directly or transitively by a group update. */
    bumpGroupMembers: function (request) {
        let groupCode = request.query && request.query.code || request.model && request.model.code;
        if (!groupCode) return Promise.resolve(true);
        let system = SERVICE.DefaultIdentityGovernanceService.getSystemAuthData();
        return SERVICE.DefaultUserGroupService.get({ tenant: request.tenant, authData: system, query: {}, options: { recursive: false } }).then(groupResult => {
            let affectedGroups = this.getAffectedGroupCodes(groupResult.result || [], groupCode);
            let find = service => service.get({ tenant: request.tenant, authData: system, query: { userGroups: { $in: affectedGroups } }, options: { recursive: false } });
            return Promise.all([find(SERVICE.DefaultEmployeeService), find(SERVICE.DefaultCustomerService)]);
        }).then(results => {
            let principals = (results[0].result || []).map(principal => ({ service: SERVICE.DefaultEmployeeService, principal: principal }))
                .concat((results[1].result || []).map(principal => ({ service: SERVICE.DefaultCustomerService, principal: principal })));
            return principals.reduce((promise, item) => promise.then(() => item.service.update({
                tenant: request.tenant,
                authData: system,
                query: { loginId: item.principal.loginId },
                model: { $set: { authVersion: this.nextVersion() } }
            })), Promise.resolve());
        }).then(() => true);
    }
};
