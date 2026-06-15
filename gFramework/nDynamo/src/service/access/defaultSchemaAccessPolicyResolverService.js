/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module dynamo/service/access/DefaultSchemaAccessPolicyResolverService
 * @description Resolves effective runtime schema/property access policy decisions
 * for a tenant, module, schema, property, action, and user-group context. This
 * service computes decisions only; generated CRUD, import/export, and admin UI
 * layers consume the decision in later enforcement slices.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this resolver to integrate external
 * policy engines, IAM/CIAM claims, ABAC conditions, or project-specific ranking
 * rules without changing Nodics core generated CRUD services.
 */
module.exports = {

    /**
     * Initializes the schema access policy resolver service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the schema access policy resolver service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Resolves an effective access decision from persisted schema access policies.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} context Policy lookup context.
     * @returns {Promise<Object>} Effective schema access decision.
     */
    resolveAccess: function (request, context) {
        return this.loadPolicies(request, context).then(policies => {
            return this.resolveFromPolicies(context, policies);
        });
    },

    /**
     * Loads candidate schema access policies through the generated policy service.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} context Policy lookup context.
     * @returns {Promise<Object[]>} Candidate policies.
     */
    loadPolicies: function (request, context) {
        if (!SERVICE.DefaultSchemaAccessPolicyService || typeof SERVICE.DefaultSchemaAccessPolicyService.get !== 'function') {
            return Promise.resolve([]);
        }
        return SERVICE.DefaultSchemaAccessPolicyService.get({
            tenant: context.tenant || request.tenant || CONFIG.get('defaultTenant') || 'default',
            options: {
                recursive: true
            },
            query: {
                moduleName: context.moduleName,
                schemaName: context.schemaName
            }
        }).then(success => {
            return success && Array.isArray(success.result) ? success.result : [];
        });
    },

    /**
     * Resolves an effective access decision from supplied candidate policies.
     *
     * @param {Object} context Policy lookup context.
     * @param {Object[]} policies Candidate policies.
     * @returns {Object} Effective schema access decision.
     */
    resolveFromPolicies: function (context, policies) {
        let normalizedContext = this.normalizeContext(context);
        let matches = (policies || []).map(policy => this.normalizePolicy(policy)).filter(policy => {
            return this.matchesPolicy(normalizedContext, policy);
        }).sort((left, right) => this.comparePolicyPrecedence(normalizedContext, left, right));
        if (matches.length === 0) {
            return this.createDecision(normalizedContext, undefined, []);
        }
        return this.createDecision(normalizedContext, matches[0], matches);
    },

    /**
     * Normalizes the policy lookup context.
     *
     * @param {Object} context Raw lookup context.
     * @returns {Object} Normalized context.
     */
    normalizeContext: function (context) {
        let normalized = Object.assign({}, context || {});
        normalized.propertyName = normalized.propertyName || '*';
        normalized.action = normalized.action ? String(normalized.action).toLowerCase() : normalized.action;
        normalized.userGroups = Array.isArray(normalized.userGroups) ? normalized.userGroups : [];
        normalized.tenant = normalized.tenant || 'default';
        return normalized;
    },

    /**
     * Normalizes a schema access policy with the contract service when available.
     *
     * @param {Object} policy Runtime policy record.
     * @returns {Object} Normalized policy.
     */
    normalizePolicy: function (policy) {
        if (SERVICE.DefaultSchemaAccessPolicyContractService &&
            typeof SERVICE.DefaultSchemaAccessPolicyContractService.normalizePolicy === 'function') {
            return SERVICE.DefaultSchemaAccessPolicyContractService.normalizePolicy(policy);
        }
        let normalized = Object.assign({}, policy || {});
        normalized.actions = Array.isArray(normalized.actions) ? normalized.actions.map(action => String(action).toLowerCase()) : [];
        normalized.effect = normalized.effect ? String(normalized.effect).toUpperCase() : normalized.effect;
        normalized.userGroups = Array.isArray(normalized.userGroups) ? normalized.userGroups : [];
        normalized.appliesToTenants = Array.isArray(normalized.appliesToTenants) ? normalized.appliesToTenants : [];
        normalized.propertyName = normalized.propertyName || '*';
        normalized.priority = normalized.priority === undefined ? 100 : normalized.priority;
        normalized.status = normalized.status || 'ACTIVE';
        return normalized;
    },

    /**
     * Checks whether a policy applies to the lookup context.
     *
     * @param {Object} context Normalized lookup context.
     * @param {Object} policy Normalized policy.
     * @returns {boolean} True when the policy matches.
     */
    matchesPolicy: function (context, policy) {
        return this.matchesStatus(policy) &&
            this.matchesTimeWindow(context, policy) &&
            this.matchesValue(context.moduleName, policy.moduleName) &&
            this.matchesValue(context.schemaName, policy.schemaName) &&
            this.matchesProperty(context.propertyName, policy.propertyName) &&
            this.matchesAction(context.action, policy.actions) &&
            this.matchesTenant(context.tenant, policy.appliesToTenants) &&
            this.matchesGroups(context.userGroups, policy.userGroups);
    },

    /**
     * Checks whether the policy is active.
     *
     * @param {Object} policy Normalized policy.
     * @returns {boolean} True when active.
     */
    matchesStatus: function (policy) {
        return !policy.status || policy.status === 'ACTIVE';
    },

    /**
     * Checks effective date boundaries.
     *
     * @param {Object} context Normalized lookup context.
     * @param {Object} policy Normalized policy.
     * @returns {boolean} True when the current date is within policy bounds.
     */
    matchesTimeWindow: function (context, policy) {
        let now = context.now ? new Date(context.now).getTime() : Date.now();
        if (policy.effectiveFrom && now < new Date(policy.effectiveFrom).getTime()) {
            return false;
        }
        if (policy.effectiveUntil && now > new Date(policy.effectiveUntil).getTime()) {
            return false;
        }
        return true;
    },

    /**
     * Checks value equality or wildcard match.
     *
     * @param {string} requested Requested value.
     * @param {string} configured Configured value.
     * @returns {boolean} True when matched.
     */
    matchesValue: function (requested, configured) {
        return configured === '*' || configured === requested;
    },

    /**
     * Checks property equality or schema-level wildcard match.
     *
     * @param {string} requested Requested property.
     * @param {string} configured Configured property.
     * @returns {boolean} True when matched.
     */
    matchesProperty: function (requested, configured) {
        return !configured || configured === '*' || configured === requested;
    },

    /**
     * Checks whether the requested action is covered by the policy.
     *
     * @param {string} requested Requested action.
     * @param {string[]} configured Configured actions.
     * @returns {boolean} True when matched.
     */
    matchesAction: function (requested, configured) {
        return Array.isArray(configured) && (configured.includes('*') || configured.includes(requested));
    },

    /**
     * Checks whether the policy applies to the tenant.
     *
     * @param {string} requested Requested tenant.
     * @param {string[]} configured Configured tenants.
     * @returns {boolean} True when matched.
     */
    matchesTenant: function (requested, configured) {
        return !Array.isArray(configured) || configured.length === 0 || configured.includes(requested);
    },

    /**
     * Checks whether the policy applies to the user's groups.
     *
     * @param {string[]} requested User group codes.
     * @param {string[]} configured Policy user group codes.
     * @returns {boolean} True when matched.
     */
    matchesGroups: function (requested, configured) {
        return !Array.isArray(configured) || configured.length === 0 || configured.some(group => requested.includes(group));
    },

    /**
     * Compares policy precedence for a lookup context.
     *
     * @param {Object} context Normalized lookup context.
     * @param {Object} left First policy.
     * @param {Object} right Second policy.
     * @returns {number} Sort comparison.
     */
    comparePolicyPrecedence: function (context, left, right) {
        return this.compareScore(this.getTenantSpecificity(context, right), this.getTenantSpecificity(context, left)) ||
            this.compareScore(this.getPropertySpecificity(context, right), this.getPropertySpecificity(context, left)) ||
            this.compareScore(this.getGroupSpecificity(context, right), this.getGroupSpecificity(context, left)) ||
            this.compareScore(left.priority, right.priority) ||
            this.compareScore(this.getEffectWeight(right.effect), this.getEffectWeight(left.effect));
    },

    /**
     * Compares two numeric scores.
     *
     * @param {number} left First score.
     * @param {number} right Second score.
     * @returns {number} Sort comparison.
     */
    compareScore: function (left, right) {
        if (left < right) return -1;
        if (left > right) return 1;
        return 0;
    },

    /**
     * Returns tenant specificity score.
     *
     * @param {Object} context Normalized lookup context.
     * @param {Object} policy Normalized policy.
     * @returns {number} Tenant specificity score.
     */
    getTenantSpecificity: function (context, policy) {
        return Array.isArray(policy.appliesToTenants) && policy.appliesToTenants.includes(context.tenant) ? 1 : 0;
    },

    /**
     * Returns property specificity score.
     *
     * @param {Object} context Normalized lookup context.
     * @param {Object} policy Normalized policy.
     * @returns {number} Property specificity score.
     */
    getPropertySpecificity: function (context, policy) {
        return policy.propertyName === context.propertyName ? 1 : 0;
    },

    /**
     * Returns user-group specificity score.
     *
     * @param {Object} context Normalized lookup context.
     * @param {Object} policy Normalized policy.
     * @returns {number} Group specificity score.
     */
    getGroupSpecificity: function (context, policy) {
        return Array.isArray(policy.userGroups) && policy.userGroups.some(group => context.userGroups.includes(group)) ? 1 : 0;
    },

    /**
     * Returns effect priority when other precedence dimensions tie.
     *
     * @param {string} effect Policy effect.
     * @returns {number} Effect weight.
     */
    getEffectWeight: function (effect) {
        return {
            DENY: 50,
            READONLY: 40,
            HIDE: 30,
            MASK: 20,
            ALLOW: 10
        }[effect] || 0;
    },

    /**
     * Creates the effective access decision.
     *
     * @param {Object} context Normalized lookup context.
     * @param {Object|undefined} policy Winning policy.
     * @param {Object[]} matches Matched policies.
     * @returns {Object} Effective access decision.
     */
    createDecision: function (context, policy, matches) {
        let effect = policy ? policy.effect : 'ALLOW';
        return {
            allowed: !['DENY', 'READONLY'].includes(effect),
            effect: effect,
            maskStrategy: policy ? policy.maskStrategy : undefined,
            policyCode: policy ? policy.code : undefined,
            policy: policy,
            matchedPolicies: matches || [],
            context: context,
            reason: policy ? 'Matched runtime schema access policy' : 'No matching runtime schema access policy'
        };
    }
};
