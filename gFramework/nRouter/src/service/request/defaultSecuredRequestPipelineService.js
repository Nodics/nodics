/**
 * @module router/service/request/DefaultSecuredRequestPipelineService
 * @description Secured API request pipeline that validates credentials, authorizes API
 * keys or bearer tokens, resolves active tenant context, and checks route access groups
 * before controller execution.
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
            this.LOG.debug('Authorizing api key : ' + request.apiKey);
            SERVICE.DefaultAuthorizationProviderService.authorizeAPIKey(request).then(success => {
                request.authData = {
                    enterprise: success.enterprise,
                    tenant: success.enterprise.tenant.code,
                    entCode: success.enterprise.code,
                    person: success.person,
                    userGroups: success.person.userGroupCodes || UTILS.getUserGroupCodes(success.person.userGroups)
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
            this.LOG.debug('Authorizing auth token : ' + request.authToken);
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
     * Verifies that the authenticated principal belongs to at least one router access group.
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
        if (request.authData.userGroups.filter(userGroup => request.router.accessGroups.includes(userGroup)).length > 0) {
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.NodicsError('ERR_AUTH_00003', 'current user do not have access to this resource'));
        }

    },
};
