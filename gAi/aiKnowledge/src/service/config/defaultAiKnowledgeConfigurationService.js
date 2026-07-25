/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/src/service/config/defaultAiKnowledgeConfigurationService
 * @description Validates effective layered Knowledge configuration and creates immutable, secret-safe runtime snapshots.
 * @layer service
 * @owner aiKnowledge
 * @override Later modules may strengthen validation or diagnostics but must preserve source, search, and isolation authority.
 */
const allowedKeys = ['contractVersion', 'enabled', 'configuration', 'sourcePolicy', 'retrieval',
    'chunking', 'embeddingProfile', 'evidenceOptimization', 'embeddingOptimization', 'lifecycle',
    'ingestion', 'security'];
const forbiddenSecretNames = ['apikey', 'accesstoken', 'credential', 'password', 'privatekey', 'secret', 'token'];

function transform(value, redact) {
    if (Array.isArray(value)) return value.map(item => transform(item, redact));
    if (value && typeof value === 'object') {
        return Object.keys(value).reduce((result, key) => {
            result[key] = redact && key === 'secretReference' && value[key] ?
                '[SECRET_REFERENCE]' : transform(value[key], redact);
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
            throw new Error('Knowledge configuration contains forbidden inline secret property: ' + childPath);
        }
        assertNoInlineSecrets(value[key], childPath);
    });
}

module.exports = {
    /**
     * Validates an already-merged effective Knowledge configuration.
     * @param {Object} configuration Effective `aiKnowledge` property subtree.
     * @returns {boolean} True when configuration satisfies fixed invariants.
     */
    validate: function (configuration) {
        if (!configuration || configuration.contractVersion !== 1) {
            throw new Error('Knowledge configuration contractVersion must be 1');
        }
        if (configuration.configuration && configuration.configuration.rejectUnknownKeys === true) {
            const unknownKeys = Object.keys(configuration).filter(key => !allowedKeys.includes(key));
            if (unknownKeys.length) throw new Error('Unknown Knowledge configuration keys: ' + unknownKeys.join(', '));
        }
        if (!configuration.sourcePolicy || configuration.sourcePolicy.excludeTemporaryRootDocs !== true ||
            configuration.sourcePolicy.requireExplicitModelProjection !== true ||
            configuration.sourcePolicy.allowGenericSchemaDiscovery !== false ||
            configuration.sourcePolicy.allowDirectDatabaseRead !== false) {
            throw new Error('Knowledge source-authority invariants cannot be weakened by configuration');
        }
        if (!configuration.retrieval || configuration.retrieval.searchAuthority !== 'nSearch' ||
            configuration.retrieval.requireCitations !== true) {
            throw new Error('Knowledge retrieval must use nSearch and require citations');
        }
        if (!configuration.security || configuration.security.enforceTenantIsolation !== true ||
            configuration.security.enforceAudienceIsolation !== true ||
            configuration.security.enforceClassification !== true ||
            configuration.security.allowWritesFromRetrieval !== false ||
            configuration.security.allowInlineSecrets !== false) {
            throw new Error('Knowledge isolation and read-only invariants cannot be weakened by configuration');
        }
        if (!configuration.embeddingProfile || typeof configuration.embeddingProfile !== 'string') {
            throw new Error('AI Knowledge requires an aiProviders usage-profile code');
        }
        if (!configuration.evidenceOptimization || configuration.evidenceOptimization.enabled !== true ||
            configuration.evidenceOptimization.preserveCitations !== true ||
            configuration.evidenceOptimization.preserveSourceIdentity !== true) {
            throw new Error('AI Knowledge token optimization must preserve citations and source identity');
        }
        if (!configuration.embeddingOptimization || configuration.embeddingOptimization.enabled !== true ||
            configuration.embeddingOptimization.contentHashDeduplication !== true ||
            configuration.embeddingOptimization.skipUnchangedContent !== true) {
            throw new Error('AI Knowledge embedding optimization must prevent duplicate unchanged work');
        }
        if (!configuration.ingestion ||
            !Number.isSafeInteger(configuration.ingestion.maximumDocumentsPerRun) ||
            configuration.ingestion.maximumDocumentsPerRun < 1 ||
            !Number.isSafeInteger(configuration.ingestion.maximumDocumentBytes) ||
            configuration.ingestion.maximumDocumentBytes < 1) {
            throw new Error('AI Knowledge ingestion bounds are invalid');
        }
        assertNoInlineSecrets(configuration, 'aiKnowledge');
        return true;
    },

    /**
     * Creates a secret-safe immutable diagnostic/runtime snapshot.
     * @param {Object} configuration Effective `aiKnowledge` property subtree.
     * @param {Object} origins Optional sanitized property-origin map supplied by Nodics configuration governance.
     * @returns {Object} Immutable versioned snapshot.
     */
    snapshot: function (configuration, origins) {
        this.validate(configuration);
        return deepFreeze({
            contractVersion: 1,
            effective: transform(configuration, true),
            origins: transform(origins || {}, true)
        });
    }
};
