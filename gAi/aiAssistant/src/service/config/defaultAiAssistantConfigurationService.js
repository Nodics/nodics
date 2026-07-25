/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/src/service/config/defaultAiAssistantConfigurationService
 * @description Validates effective layered Assistant configuration and creates immutable, secret-safe runtime snapshots.
 * @layer service
 * @owner aiAssistant
 * @override Later modules may strengthen validation or diagnostics but must preserve fail-closed security invariants.
 */
const allowedKeys = ['contractVersion', 'enabled', 'configuration', 'streaming', 'providerProfile',
    'api', 'tools', 'quotas', 'execution', 'confirmations', 'observability', 'contextOptimization', 'guardrails', 'retention', 'security'];
const forbiddenSecretNames = ['apikey', 'accesstoken', 'credential', 'password', 'privatekey', 'secret', 'token'];

function copy(value) {
    if (Array.isArray(value)) return value.map(copy);
    if (value && typeof value === 'object') {
        return Object.keys(value).reduce((result, key) => {
            result[key] = copy(value[key]);
            return result;
        }, {});
    }
    return value;
}

function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.keys(value).forEach(key => deepFreeze(value[key]));
    }
    return value;
}

function assertNoInlineSecrets(value, path) {
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(key => {
        const childPath = path ? path + '.' + key : key;
        const normalizedKey = key.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
        if (key !== 'secretReference' &&
            forbiddenSecretNames.some(name => normalizedKey.endsWith(name)) &&
            value[key] !== undefined) {
            throw new Error('Assistant configuration contains forbidden inline secret property: ' + childPath);
        }
        assertNoInlineSecrets(value[key], childPath);
    });
}

function sanitize(value) {
    if (Array.isArray(value)) return value.map(sanitize);
    if (value && typeof value === 'object') {
        return Object.keys(value).reduce((result, key) => {
            result[key] = key === 'secretReference' && value[key] ? '[SECRET_REFERENCE]' : sanitize(value[key]);
            return result;
        }, {});
    }
    return value;
}

module.exports = {
    /**
     * Validates an already-merged effective Assistant configuration.
     * @param {Object} configuration Effective `aiAssistant` property subtree.
     * @returns {boolean} True when configuration satisfies fixed invariants.
     */
    validate: function (configuration) {
        if (!configuration || configuration.contractVersion !== 1) {
            throw new Error('Assistant configuration contractVersion must be 1');
        }
        if (configuration.configuration && configuration.configuration.rejectUnknownKeys === true) {
            const unknownKeys = Object.keys(configuration).filter(key => !allowedKeys.includes(key));
            if (unknownKeys.length) throw new Error('Unknown Assistant configuration keys: ' + unknownKeys.join(', '));
        }
        if (!configuration.security || configuration.security.allowBrowserCredentials !== false ||
            configuration.security.allowInlineSecrets !== false ||
            configuration.security.allowModelSelfApproval !== false ||
            configuration.security.allowProviderNativeTools !== false) {
            throw new Error('Assistant security invariants cannot be enabled by configuration');
        }
        if (!configuration.tools || configuration.tools.requireTargetAuthorization !== true ||
            configuration.tools.requireConfirmationForMutations !== true ||
            configuration.tools.defaultMode !== 'DENY' ||
            !Number.isSafeInteger(configuration.tools.maximumCallsPerTurn) ||
            configuration.tools.maximumCallsPerTurn < 1 || configuration.tools.maximumCallsPerTurn > 32 ||
            !Number.isSafeInteger(configuration.tools.requestTimeoutMs) ||
            configuration.tools.requestTimeoutMs < 100 || configuration.tools.requestTimeoutMs > 30000 ||
            !Number.isSafeInteger(configuration.tools.maximumCatalogueBytes) ||
            configuration.tools.maximumCatalogueBytes < 1024 ||
            !Number.isSafeInteger(configuration.tools.maximumResultBytes) ||
            configuration.tools.maximumResultBytes < 1024 ||
            !Number.isSafeInteger(configuration.tools.maximumResultCharacters) ||
            configuration.tools.maximumResultCharacters < 1 ||
            !Number.isSafeInteger(configuration.tools.maximumPlanCharacters) ||
            configuration.tools.maximumPlanCharacters < 256 ||
            configuration.tools.maximumPlanCharacters > 65536) {
            throw new Error('Assistant target authorization and mutation confirmation are mandatory');
        }
        if (!configuration.quotas || configuration.quotas.failClosed !== true) {
            throw new Error('Assistant quota enforcement must fail closed');
        }
        if (!configuration.contextOptimization || configuration.contextOptimization.enabled !== true ||
            configuration.contextOptimization.preserveSecurityInstructions !== true ||
            configuration.contextOptimization.preserveAuthorizationContext !== true ||
            configuration.contextOptimization.preserveConfirmationRequirements !== true) {
            throw new Error('AI Assistant context optimization cannot remove governed instructions or authorization context');
        }
        if (configuration.streaming && configuration.streaming.transport !== 'SSE') {
            throw new Error('Assistant contract version 1 supports SSE streaming only');
        }
        if (!configuration.streaming || !Number.isSafeInteger(configuration.streaming.heartbeatMs) ||
            configuration.streaming.heartbeatMs < 1000 ||
            !Number.isSafeInteger(configuration.streaming.reconnectWindowMs) ||
            configuration.streaming.reconnectWindowMs < configuration.streaming.heartbeatMs ||
            !Number.isSafeInteger(configuration.streaming.maxEventBytes) ||
            configuration.streaming.maxEventBytes < 1024 ||
            !Number.isSafeInteger(configuration.streaming.deltaBatchCharacters) ||
            configuration.streaming.deltaBatchCharacters < 1) {
            throw new Error('AI Assistant streaming bounds are invalid');
        }
        if (!configuration.providerProfile || typeof configuration.providerProfile !== 'string') {
            throw new Error('AI Assistant requires an aiProviders usage-profile code');
        }
        if (!configuration.api || !Number.isSafeInteger(configuration.api.maximumPageSize) ||
            configuration.api.maximumPageSize < 1 || configuration.api.maximumPageSize > 100 ||
            !Number.isSafeInteger(configuration.api.maximumEventReplaySize) ||
            configuration.api.maximumEventReplaySize < 1 || configuration.api.maximumEventReplaySize > 1000) {
            throw new Error('AI Assistant API pagination bounds are invalid');
        }
        if (!configuration.execution ||
            !Number.isSafeInteger(configuration.execution.leaseDurationMs) ||
            !Number.isSafeInteger(configuration.execution.heartbeatIntervalMs) ||
            configuration.execution.heartbeatIntervalMs < 1000 ||
            configuration.execution.leaseDurationMs < configuration.execution.heartbeatIntervalMs * 2 ||
            !Number.isSafeInteger(configuration.execution.acceptedRecoveryAgeMs) ||
            configuration.execution.acceptedRecoveryAgeMs < configuration.execution.heartbeatIntervalMs ||
            !Number.isSafeInteger(configuration.execution.recoveryBatchSize) ||
            configuration.execution.recoveryBatchSize < 1 || configuration.execution.recoveryBatchSize > 100) {
            throw new Error('AI Assistant execution lease bounds are invalid');
        }
        if (!configuration.confirmations ||
            !Number.isSafeInteger(configuration.confirmations.ttlSeconds) ||
            configuration.confirmations.ttlSeconds < 60 || configuration.confirmations.ttlSeconds > 3600 ||
            !Number.isSafeInteger(configuration.confirmations.executionTimeoutMs) ||
            configuration.confirmations.executionTimeoutMs < 100 ||
            configuration.confirmations.executionTimeoutMs > 30000) {
            throw new Error('AI Assistant confirmation bounds are invalid');
        }
        if (!configuration.observability ||
            !Number.isSafeInteger(configuration.observability.heartbeatFailureDegradedWindowMs) ||
            configuration.observability.heartbeatFailureDegradedWindowMs < 1000) {
            throw new Error('AI Assistant observability bounds are invalid');
        }
        if (!configuration.guardrails ||
            !Number.isSafeInteger(configuration.guardrails.maximumMessageCharacters) ||
            configuration.guardrails.maximumMessageCharacters < 1 ||
            !Array.isArray(configuration.guardrails.redactionPatterns)) {
            throw new Error('AI Assistant guardrail configuration is invalid');
        }
        assertNoInlineSecrets(configuration, 'aiAssistant');
        return true;
    },

    /**
     * Creates a secret-safe immutable diagnostic/runtime snapshot.
     * @param {Object} configuration Effective `aiAssistant` property subtree.
     * @param {Object} origins Optional sanitized property-origin map supplied by Nodics configuration governance.
     * @returns {Object} Immutable versioned snapshot.
     */
    snapshot: function (configuration, origins) {
        this.validate(configuration);
        return deepFreeze({
            contractVersion: 1,
            effective: sanitize(copy(configuration)),
            origins: sanitize(copy(origins || {}))
        });
    }
};
