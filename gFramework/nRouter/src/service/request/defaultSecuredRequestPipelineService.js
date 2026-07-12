/**
 * @module router/service/request/DefaultSecuredRequestPipelineService
 * @description Secured API request pipeline that validates credentials, authorizes API
 * keys or bearer tokens, resolves active tenant context, checks route access groups,
 * and optionally checks action-level route permissions before controller execution.
 * @layer pipeline
 * @owner nRouter
 * @override Project modules may override this service or secured request pipeline
 * definition to introduce custom IAM, CIAM, OAuth2, SSO, or tenant authorization logic.
 *
 * @property {Object} CLASSES.NodicsError Standard Nodics error class used for authorization failures.
 * @property {Object} SERVICE.DefaultAuthorizationProviderService Authorization provider used for API keys and tokens.
 * @property {Object} request.auth Normalized credential contract produced by `DefaultRequestHandlerPipelineService`.
 * @property {Object} request.authData Authenticated principal, enterprise, tenant, and user group context.
 * @property {string} request.tenant Active tenant resolved from the authorized credential.
 * @property {string[]} request.router.accessGroups Groups allowed to access the selected router.
 * @property {string|string[]} request.router.permission Action permission required by the selected router.
 * @property {string|string[]} request.router.permissionConfig Layered configuration path for route permissions.
 */
module.exports = {
    /**
     * Initializes the secured request pipeline service during service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the secured request pipeline service after service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Validates that a secured request contains exactly one supported credential.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.auth Normalized authentication metadata.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @throws Emits `ERR_AUTH_00002` when credentials are missing or ambiguous.
     */
    validateSecuredRequest: function (request, response, process) {
        let credentials = request.auth && request.auth.credentials ? request.auth.credentials : [];
        if (credentials.length === 0) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00002'));
        } else if (credentials.length > 1) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00002'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Authorizes API-key credentials and resolves enterprise, tenant, person, and user groups.
     *
     * @param {Object} request Nodics request context.
     * @param {string} request.apiKey API key extracted from normalized headers.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @sideEffects Writes `request.authData` and active `request.tenant`.
     * @throws Propagates authorization provider errors through the pipeline.
     */
    authorizeAPIKey: function (request, response, process) {
        if (request.apiKey) {
            this.LOG.debug('Authorizing API key credential');
            SERVICE.DefaultAuthorizationProviderService.authorizeAPIKey(request).then(success => {
                request.authData = {
                    enterprise: success.enterprise,
                    tenant: success.enterprise.tenant.code,
                    entCode: success.enterprise.code,
                    person: success.person,
                    userGroups: success.person.userGroupCodes || UTILS.getUserGroupCodes(success.person.userGroups),
                    permissions: success.person.apiKeyScopes || success.person.userGroupPermissions || UTILS.getUserGroupPermissions(success.person.userGroups),
                    apiKeyScopes: success.person.apiKeyScopes || []
                };
                request.tenant = success.enterprise.tenant.code;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Authorizes bearer token credentials and resolves active principal context.
     *
     * @param {Object} request Nodics request context.
     * @param {string} request.authToken Bearer token extracted from normalized headers.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @sideEffects Writes `request.authData` and active `request.tenant`.
     * @throws Emits `ERR_AUTH_00001` for invalid token payloads or provider failures.
     */
    authorizeAuthToken: function (request, response, process) {
        if (request.authToken) {
            this.LOG.debug('Authorizing bearer token credential');
            SERVICE.DefaultAuthorizationProviderService.authorizeToken(request).then(success => {
                try {
                    if (success.result && !UTILS.isBlank(success.result)) {
                        request.authData = success.result;
                        request.tenant = success.result.tenant;
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00001'));
                    }
                } catch (err) {
                    process.error(request, response, new CLASSES.NodicsError(err, ' While authorizing token', 'ERR_AUTH_00001'));
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Ensures secured authorization produced both enterprise and tenant context.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.authData Authenticated principal context.
     * @param {string} request.tenant Active tenant resolved from credential.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @throws Emits `ERR_AUTH_00002` when secured request context is incomplete.
     */
    validateRequestData: function (request, response, process) {
        if (!request.authData || !request.authData.entCode) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00002', 'Invalid secured request'));
        } else if (!request.tenant) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00002', 'Invalid secured request'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Verifies that the authenticated principal belongs to at least one router access group
     * and, when configured, has the route action permission.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.authData Authenticated principal context.
     * @param {string[]} request.authData.userGroups Principal user group codes.
     * @param {Object} request.router Effective router definition.
     * @param {string[]} request.router.accessGroups Allowed access groups for this route.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @throws Emits `ERR_AUTH_00003` when the principal cannot access the route.
     */
    checkAccess: function (request, response, process) {
        if (!this.hasAccessGroup(request)) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00003', 'current user do not have access to this resource'));
            return;
        }
        if (!this.hasRoutePermission(request)) {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00003', 'current user does not have permission to execute this action'));
            return;
        }
        process.nextSuccess(request, response);
    },

    /**
     * Checks route access-group compatibility.
     *
     * @param {Object} request Nodics request context.
     * @returns {boolean} True when user has one allowed access group.
     */
    hasAccessGroup: function (request) {
        let userGroups = request.authData && request.authData.userGroups ? request.authData.userGroups : [];
        let accessGroups = request.router && request.router.accessGroups ? request.router.accessGroups : [];
        return userGroups.filter(userGroup => accessGroups.includes(userGroup)).length > 0;
    },

    /**
     * Checks action-level route permission when route metadata asks for it.
     * Routes may define literal `permission`/`permissions` values or
     * `permissionConfig` paths that resolve through the effective layered
     * configuration.
     *
     * @param {Object} request Nodics request context.
     * @returns {boolean} True when route permission check passes.
     */
    hasRoutePermission: function (request) {
        let requiredPermissions = this.getRoutePermissions(request.router || {});
        if (requiredPermissions.length === 0) {
            return true;
        }
        let config = this.getRouteActionAuthorizationConfig();
        if (config.enabled === false) {
            return true;
        }
        let grantedPermissions = this.getGrantedPermissions(request);
        if (grantedPermissions.length === 0 && config.strict !== true) {
            return true;
        }
        return requiredPermissions.some(permission => this.isPermissionGranted(permission, grantedPermissions, config));
    },

    /**
     * Returns route permission metadata as a normalized list.
     *
     * @param {Object} router Effective router definition.
     * @returns {string[]} Required route permissions.
     */
    getRoutePermissions: function (router) {
        let permissions = []
            .concat(this.normalizePermissions(router.permissions))
            .concat(this.normalizePermissions(router.permission))
            .concat(this.resolveConfiguredRoutePermissions(router.permissionConfig));
        return Array.from(new Set(permissions.filter(Boolean)));
    },

    /** Normalizes route permission metadata to an array. */
    normalizePermissions: function (permissions) {
        if (typeof permissions === 'string') {
            return [permissions];
        }
        return Array.isArray(permissions) ? permissions : [];
    },

    /** Resolves one or more route permission configuration paths. */
    resolveConfiguredRoutePermissions: function (permissionConfig) {
        return this.normalizePermissions(permissionConfig).reduce((permissions, configPath) => {
            return permissions.concat(this.normalizePermissions(this.getConfigurationValue(configPath)));
        }, []);
    },

    /** Reads a layered configuration value by direct key or dotted path. */
    getConfigurationValue: function (configPath) {
        if (!configPath || typeof CONFIG === 'undefined' || typeof CONFIG.get !== 'function') return undefined;
        let directValue = CONFIG.get(configPath);
        if (directValue !== undefined) return directValue;
        let pathParts = configPath.split('.');
        let value = CONFIG.get(pathParts.shift());
        while (value !== undefined && value !== null && pathParts.length > 0) {
            value = value[pathParts.shift()];
        }
        return value;
    },

    /**
     * Returns principal and group-derived permissions.
     *
     * @param {Object} request Nodics request context.
     * @returns {string[]} Granted permission list.
     */
    getGrantedPermissions: function (request) {
        let authData = request.authData || {};
        let permissions = [];
        ['permissions', 'actionPermissions', 'authorities', 'scopes'].forEach(property => {
            if (Array.isArray(authData[property])) {
                permissions = permissions.concat(authData[property]);
            }
        });
        permissions = permissions.concat(this.getGroupPermissions(authData.userGroups || []));
        return Array.from(new Set(permissions));
    },

    /**
     * Returns permissions granted by authenticated user groups.
     *
     * @param {string[]} userGroups Authenticated user group codes.
     * @returns {string[]} Group-derived permissions.
     */
    getGroupPermissions: function (userGroups) {
        let groupPermissions = this.getRouteActionAuthorizationConfig().groupPermissions || {};
        return userGroups.reduce((permissions, userGroup) => {
            if (Array.isArray(groupPermissions[userGroup])) {
                return permissions.concat(groupPermissions[userGroup]);
            }
            return permissions;
        }, []);
    },

    /**
     * Determines if a required permission is granted.
     *
     * @param {string} requiredPermission Required permission.
     * @param {string[]} grantedPermissions Granted permissions.
     * @param {Object} config Route action authorization config.
     * @returns {boolean} True when permission is granted.
     */
    isPermissionGranted: function (requiredPermission, grantedPermissions, config) {
        let superPermissions = config.superPermissions || [];
        let grants = grantedPermissions.concat(superPermissions.filter(permission => grantedPermissions.includes(permission)));
        return grants.some(grantedPermission => {
            return grantedPermission === requiredPermission ||
                grantedPermission === '*' ||
                this.matchesWildcardPermission(requiredPermission, grantedPermission);
        });
    },

    /**
     * Matches a wildcard permission such as runtime.config.*.
     *
     * @param {string} requiredPermission Required permission.
     * @param {string} grantedPermission Granted permission.
     * @returns {boolean} True when wildcard grant matches.
     */
    matchesWildcardPermission: function (requiredPermission, grantedPermission) {
        if (!grantedPermission || grantedPermission.indexOf('*') === -1) {
            return false;
        }
        let prefix = grantedPermission.replace(/\*$/, '');
        return requiredPermission.indexOf(prefix) === 0;
    },

    /**
     * Returns route action authorization configuration.
     *
     * @returns {Object} Authorization configuration.
     */
    getRouteActionAuthorizationConfig: function () {
        return CONFIG.get('routeActionAuthorization') || {};
    }
};
