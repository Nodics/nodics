/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/service/schema/DefaultSchemaWriteAccessPolicyService
 * @description Enforces runtime schema/property access policy decisions before
 * generated write operations reach persistence. This service protects create,
 * update, and import payloads while remaining optional for module sets that do
 * not include the runtime policy resolver.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this service to customize property
 * write semantics, nested update handling, or policy error structure without
 * changing generated CRUD save/update pipelines.
 */
module.exports = {

    /**
     * Initializes the write access policy service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the write access policy service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Enforces create policies against the submitted model payload.
     *
     * @param {Object} request Nodics save request.
     * @param {Object} response Pipeline response accumulator.
     * @returns {Promise<Object>} Resolves when the payload is allowed.
     */
    enforceCreatePolicies: function (request, response) {
        return this.enforceWritePolicies(request, response, 'create');
    },

    /**
     * Enforces update policies against the submitted update payload.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @returns {Promise<Object>} Resolves when the payload is allowed.
     */
    enforceUpdatePolicies: function (request, response) {
        return this.enforceWritePolicies(request, response, 'update');
    },

    /**
     * Enforces import policies against submitted import model payloads.
     *
     * @param {Object} request Nodics import request adapted to the write policy contract.
     * @param {Object} response Pipeline response accumulator.
     * @returns {Promise<Object>} Resolves when the payload is allowed.
     */
    enforceImportPolicies: function (request, response) {
        return this.enforceWritePolicies(request, response, 'import');
    },

    /**
     * Enforces delete policies before generated remove operations mutate data.
     *
     * @param {Object} request Nodics remove request.
     * @param {Object} response Pipeline response accumulator.
     * @returns {Promise<Object>} Resolves when delete is allowed.
     */
    enforceDeletePolicies: function (request, response) {
        if (!this.isPolicyResolverAvailable() || !request || !request.schemaModel) {
            return Promise.resolve(response);
        }
        return this.resolvePropertyDecisions(request, ['*'], 'delete').then(decisions => {
            let violations = this.findWriteViolations(decisions);
            if (violations.length > 0) {
                return Promise.reject(this.createPolicyError('delete', violations));
            }
            response.policy = response.policy || {};
            response.policy.delete = this.buildPolicyMetadata('delete', decisions);
            return response;
        });
    },

    /**
     * Enforces runtime write policies for the requested action.
     *
     * @param {Object} request Nodics write request.
     * @param {Object} response Pipeline response accumulator.
     * @param {string} action Write action.
     * @returns {Promise<Object>} Resolves with response or rejects with a policy error.
     */
    enforceWritePolicies: function (request, response, action) {
        if (!this.isPolicyResolverAvailable() || !request || !request.model || !request.schemaModel) {
            return Promise.resolve(response);
        }
        let submittedProperties = this.getSubmittedSchemaProperties(request);
        if (submittedProperties.length === 0) {
            return Promise.resolve(response);
        }
        return this.resolvePropertyDecisions(request, submittedProperties, action).then(decisions => {
            let violations = this.findWriteViolations(decisions);
            if (violations.length > 0) {
                return Promise.reject(this.createPolicyError(action, violations));
            }
            response.policy = response.policy || {};
            response.policy[action] = this.buildPolicyMetadata(action, decisions);
            return response;
        });
    },

    /**
     * Checks whether the runtime policy resolver is available in the active module set.
     *
     * @returns {boolean} True when policy resolution can be performed.
     */
    isPolicyResolverAvailable: function () {
        return SERVICE.DefaultSchemaAccessPolicyResolverService &&
            typeof SERVICE.DefaultSchemaAccessPolicyResolverService.resolveAccess === 'function';
    },

    /**
     * Returns submitted top-level schema properties from the write payload.
     *
     * @param {Object} request Nodics write request.
     * @returns {string[]} Submitted schema property names.
     */
    getSubmittedSchemaProperties: function (request) {
        let schemaProperties = this.getSchemaProperties(request);
        let submittedProperties = this.getSubmittedProperties(request.model);
        return submittedProperties.filter(propertyName => schemaProperties.includes(propertyName));
    },

    /**
     * Returns top-level properties defined by the generated schema.
     *
     * @param {Object} request Nodics write request.
     * @returns {string[]} Schema property names.
     */
    getSchemaProperties: function (request) {
        let definition = request.schemaModel && request.schemaModel.rawSchema ? request.schemaModel.rawSchema.definition : {};
        return Object.keys(definition || {});
    },

    /**
     * Extracts top-level submitted properties from plain or operator update payloads.
     *
     * @param {Object} model Submitted model or update payload.
     * @returns {string[]} Submitted top-level property names.
     */
    getSubmittedProperties: function (model) {
        if (Array.isArray(model)) {
            let modelProperties = [];
            model.forEach(item => {
                modelProperties = modelProperties.concat(this.getSubmittedProperties(item));
            });
            return Array.from(new Set(modelProperties));
        }
        let properties = [];
        Object.keys(model || {}).forEach(propertyName => {
            if (propertyName.charAt(0) === '$' && model[propertyName] && typeof model[propertyName] === 'object') {
                properties = properties.concat(Object.keys(model[propertyName]).map(child => this.getTopLevelProperty(child)));
            } else {
                properties.push(this.getTopLevelProperty(propertyName));
            }
        });
        return Array.from(new Set(properties));
    },

    /**
     * Returns the top-level property from a potentially nested path.
     *
     * @param {string} propertyPath Submitted property path.
     * @returns {string} Top-level property name.
     */
    getTopLevelProperty: function (propertyPath) {
        return String(propertyPath).split('.')[0];
    },

    /**
     * Resolves write decisions for submitted properties.
     *
     * @param {Object} request Nodics write request.
     * @param {string[]} properties Submitted schema properties.
     * @param {string} action Write action.
     * @returns {Promise<Object>} Property decision map.
     */
    resolvePropertyDecisions: function (request, properties, action) {
        let decisions = {};
        return Promise.all(properties.map(propertyName => {
            return SERVICE.DefaultSchemaAccessPolicyResolverService.resolveAccess(request, {
                tenant: request.tenant,
                moduleName: request.schemaModel.moduleName,
                schemaName: request.schemaModel.schemaName,
                propertyName: propertyName,
                action: action,
                userGroups: this.getUserGroups(request),
                now: request.now
            }).then(decision => {
                decisions[propertyName] = decision;
            });
        })).then(() => decisions);
    },

    /**
     * Returns user groups from the authenticated request context.
     *
     * @param {Object} request Nodics write request.
     * @returns {string[]} User group codes.
     */
    getUserGroups: function (request) {
        return request.authData && Array.isArray(request.authData.userGroups) ? request.authData.userGroups : [];
    },

    /**
     * Finds write policy violations from resolved decisions.
     *
     * @param {Object} decisions Property decision map.
     * @returns {Object[]} Violating property decisions.
     */
    findWriteViolations: function (decisions) {
        return Object.keys(decisions).filter(propertyName => {
            return this.isWriteProtectedEffect(decisions[propertyName].effect);
        }).map(propertyName => {
            return {
                propertyName: propertyName,
                effect: decisions[propertyName].effect,
                policyCode: decisions[propertyName].policyCode
            };
        });
    },

    /**
     * Checks whether an effect prevents write mutation.
     *
     * @param {string} effect Policy effect.
     * @returns {boolean} True when writes must be blocked.
     */
    isWriteProtectedEffect: function (effect) {
        return ['DENY', 'HIDE', 'READONLY'].includes(String(effect || '').toUpperCase());
    },

    /**
     * Builds a structured policy error for blocked writes.
     *
     * @param {string} action Write action.
     * @param {Object[]} violations Violating property decisions.
     * @returns {CLASSES.NodicsError} Policy error.
     */
    createPolicyError: function (action, violations) {
        let properties = violations.map(violation => violation.propertyName).join(', ');
        let error = new CLASSES.NodicsError('ERR_AUTH_00003', 'Current user can not ' + action + ' protected properties: ' + properties);
        error.metadata = {
            action: action,
            violations: violations
        };
        return error;
    },

    /**
     * Builds response metadata describing evaluated write policies.
     *
     * @param {string} action Write action.
     * @param {Object} decisions Property decision map.
     * @returns {Object} Policy metadata.
     */
    buildPolicyMetadata: function (action, decisions) {
        return {
            action: action,
            evaluated: Object.keys(decisions).map(propertyName => {
                return {
                    propertyName: propertyName,
                    effect: decisions[propertyName].effect,
                    policyCode: decisions[propertyName].policyCode
                };
            })
        };
    }
};
