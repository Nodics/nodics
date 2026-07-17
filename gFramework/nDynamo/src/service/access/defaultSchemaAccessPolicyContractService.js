/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module dynamo/service/access/DefaultSchemaAccessPolicyContractService
 * @description Defines and validates the runtime schema/property access policy
 * contract used by the Nodics control plane. This service owns the common
 * action/effect vocabulary only; read/write/import/export enforcement is added
 * by later generated CRUD and data-processing layers.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this service to add custom policy
 * actions, effects, validation rules, masking strategies, or IAM integration
 * without changing Nodics core runtime governance.
 */
module.exports = {

    /**
     * Initializes the schema access policy contract service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the schema access policy contract service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Returns supported schema/property access actions.
     *
     * @returns {string[]} Supported action codes.
     */
    getSupportedActions: function () {
        return ['read', 'create', 'update', 'delete', 'import', 'export'];
    },

    /**
     * Returns supported schema/property access effects.
     *
     * @returns {string[]} Supported effect codes.
     */
    getSupportedEffects: function () {
        return ['ALLOW', 'DENY', 'MASK', 'HIDE', 'READONLY'];
    },

    /**
     * Returns the policy actions that can use a masking or visibility effect.
     *
     * @returns {string[]} Read-like actions.
     */
    getReadActions: function () {
        return ['read', 'export'];
    },

    /**
     * Returns the policy actions that can change persisted data.
     *
     * @returns {string[]} Write-like actions.
     */
    getWriteActions: function () {
        return ['create', 'update', 'delete', 'import'];
    },

    /**
     * Normalizes a schema access policy into the canonical contract shape.
     *
     * @param {Object} policy Runtime schema access policy record.
     * @returns {Object} Normalized policy.
     */
    normalizePolicy: function (policy) {
        let normalized = Object.assign({}, policy || {});
        normalized.actions = this.normalizeActions(normalized.actions);
        normalized.effect = normalized.effect ? String(normalized.effect).toUpperCase() : normalized.effect;
        normalized.userGroups = Array.isArray(normalized.userGroups) ? normalized.userGroups : [];
        normalized.appliesToTenants = Array.isArray(normalized.appliesToTenants) ? normalized.appliesToTenants : [];
        normalized.propertyName = normalized.propertyName || '*';
        normalized.priority = normalized.priority === undefined ? 100 : normalized.priority;
        normalized.status = normalized.status || 'ACTIVE';
        return normalized;
    },

    /**
     * Normalizes action input into unique lower-case action codes.
     *
     * @param {string|string[]} actions Action or actions.
     * @returns {string[]} Normalized actions.
     */
    normalizeActions: function (actions) {
        let actionList = Array.isArray(actions) ? actions : [actions];
        return Array.from(new Set(actionList.filter(action => action !== undefined && action !== null).map(action => {
            return String(action).toLowerCase();
        })));
    },

    /**
     * Validates a schema access policy against the Nodics runtime contract.
     *
     * @param {Object} policy Runtime schema access policy record.
     * @returns {Object} Validation result with normalized policy and errors.
     */
    validatePolicy: function (policy) {
        let normalized = this.normalizePolicy(policy);
        let errors = [];
        this.collectRequiredFieldErrors(normalized, errors);
        this.collectActionErrors(normalized, errors);
        this.collectEffectErrors(normalized, errors);
        this.collectEffectActionCompatibilityErrors(normalized, errors);
        return {
            valid: errors.length === 0,
            errors: errors,
            policy: normalized
        };
    },

    /**
     * Collects missing required field errors.
     *
     * @param {Object} policy Normalized policy.
     * @param {Object[]} errors Mutable validation errors.
     * @returns {void}
     */
    collectRequiredFieldErrors: function (policy, errors) {
        ['moduleName', 'schemaName', 'effect'].forEach(field => {
            if (!policy[field]) {
                errors.push(this.createValidationError(field, 'required', field + ' is required'));
            }
        });
        if (!policy.actions || policy.actions.length === 0) {
            errors.push(this.createValidationError('actions', 'required', 'At least one action is required'));
        }
    },

    /**
     * Collects unsupported action errors.
     *
     * @param {Object} policy Normalized policy.
     * @param {Object[]} errors Mutable validation errors.
     * @returns {void}
     */
    collectActionErrors: function (policy, errors) {
        let supportedActions = this.getSupportedActions();
        policy.actions.forEach(action => {
            if (!supportedActions.includes(action)) {
                errors.push(this.createValidationError('actions', 'unsupported', 'Unsupported schema access action: ' + action));
            }
        });
    },

    /**
     * Collects unsupported effect errors.
     *
     * @param {Object} policy Normalized policy.
     * @param {Object[]} errors Mutable validation errors.
     * @returns {void}
     */
    collectEffectErrors: function (policy, errors) {
        if (policy.effect && !this.getSupportedEffects().includes(policy.effect)) {
            errors.push(this.createValidationError('effect', 'unsupported', 'Unsupported schema access effect: ' + policy.effect));
        }
    },

    /**
     * Collects action/effect compatibility errors.
     *
     * @param {Object} policy Normalized policy.
     * @param {Object[]} errors Mutable validation errors.
     * @returns {void}
     */
    collectEffectActionCompatibilityErrors: function (policy, errors) {
        if (!policy.effect || !policy.actions || policy.actions.length === 0) {
            return;
        }
        let readActions = this.getReadActions();
        let writeActions = this.getWriteActions();
        if (['MASK', 'HIDE'].includes(policy.effect) && policy.actions.some(action => writeActions.includes(action))) {
            errors.push(this.createValidationError('effect', 'incompatible', policy.effect + ' can only be used with read/export actions'));
        }
        if (policy.effect === 'READONLY' && policy.actions.some(action => readActions.includes(action))) {
            errors.push(this.createValidationError('effect', 'incompatible', 'READONLY can only be used with create/update/delete/import actions'));
        }
    },

    /**
     * Creates a normalized validation error.
     *
     * @param {string} field Policy field name.
     * @param {string} type Validation error type.
     * @param {string} message Validation error message.
     * @returns {Object} Validation error.
     */
    createValidationError: function (field, type, message) {
        return {
            field: field,
            type: type,
            message: message
        };
    }
};
