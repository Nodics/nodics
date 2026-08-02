/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/src/schemas/apiContracts
 * @description Defines versioned source, retrieval, evidence, and citation contracts.
 * @layer schema
 * @owner aiKnowledge
 * @override Later modules may add compatible source and projection metadata without weakening authority or isolation.
 */
const values = require('../utils/contractValues');
const identifier = { type: 'string', pattern: '^[A-Za-z][A-Za-z0-9._-]{0,127}$' };
const scope = {
    type: 'object',
    additionalProperties: false,
    required: ['tenant', 'audience'],
    properties: {
        tenant: identifier,
        enterprise: identifier,
        project: identifier,
        audience: { enum: values.audiences },
        locale: { type: 'string', maxLength: 32 },
        applicationVersion: { type: 'string', maxLength: 64 },
        classification: { enum: values.classifications }
    }
};
const citation = {
    type: 'object',
    additionalProperties: false,
    required: ['citationId', 'documentId', 'sourceId', 'title', 'locator'],
    properties: {
        citationId: identifier,
        documentId: identifier,
        sourceId: identifier,
        title: { type: 'string', minLength: 1, maxLength: 512 },
        locator: { type: 'string', minLength: 1, maxLength: 2048 },
        section: { type: 'string', maxLength: 512 },
        version: { type: 'string', maxLength: 64 },
        navigationType: { enum: ['NONE', 'INTERNAL_ROUTE'] },
        navigationTarget: { type: 'string', minLength: 1, maxLength: 2048 }
    }
};

module.exports = {
    contractVersion: 1,
    scope: scope,
    sourceContribution: {
        type: 'object',
        additionalProperties: false,
        required: ['contractVersion', 'sourceId', 'ownerModule', 'sourceType', 'scope', 'projection'],
        properties: {
            contractVersion: { const: 1 },
            sourceId: identifier,
            ownerModule: identifier,
            sourceType: { enum: values.sourceTypes },
            scope: scope,
            projection: { type: 'object' },
            synchronizationMode: { enum: ['EVENT', 'SCHEDULED', 'MANUAL'] }
        }
    },
    retrievalRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['contractVersion', 'query', 'scope', 'mode', 'corpusCode', 'allowedClassifications'],
        properties: {
            contractVersion: { const: 1 },
            query: { type: 'string', minLength: 1, maxLength: 8000 },
            scope: scope,
            mode: { enum: values.retrievalModes },
            searchMode: { enum: values.searchModes },
            corpusCode: identifier,
            audience: { enum: values.audiences },
            allowedClassifications: {
                type: 'array', minItems: 1, uniqueItems: true,
                items: { enum: values.classifications }
            },
            maximumResults: { type: 'integer', minimum: 1, maximum: 100 }
        }
    },
    evidence: {
        type: 'object',
        additionalProperties: false,
        required: ['evidenceId', 'documentId', 'chunkId', 'score', 'content', 'citation'],
        properties: {
            evidenceId: identifier,
            documentId: identifier,
            chunkId: identifier,
            score: { type: 'number', minimum: 0 },
            content: { type: 'string', minLength: 1 },
            citation: citation
        }
    },
    citation: citation,
    retrievalResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['contractVersion', 'mode', 'evidence', 'sufficientEvidence'],
        properties: {
            contractVersion: { const: 1 },
            mode: { enum: ['INDEXED', 'LIVE', 'HYBRID'] },
            searchMode: { enum: ['LEXICAL', 'VECTOR', 'HYBRID'] },
            evidence: { type: 'array', items: { type: 'object' } },
            sufficientEvidence: { type: 'boolean' },
            insufficiencyReason: { type: 'string', maxLength: 512 }
        }
    },
    ingestionRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['source', 'indexVersion', 'documents'],
        properties: {
            runCode: identifier,
            indexVersion: identifier,
            embed: { type: 'boolean' },
            configurationRevision: { type: 'string', maxLength: 128 },
            source: {
                type: 'object', additionalProperties: false,
                required: ['sourceCode', 'corpusCode', 'sourceType'],
                properties: {
                    sourceCode: identifier, corpusCode: identifier,
                    sourceType: { enum: ['GDOCS', 'CMS', 'MODEL_PROJECTION', 'PARTNER_DOCUMENTATION'] },
                    path: { type: 'string', maxLength: 2048 }
                }
            },
            documents: {
                type: 'array', minItems: 1, maxItems: 1000,
                items: {
                    type: 'object', additionalProperties: false,
                    required: ['sourceIdentity', 'title', 'locator', 'content', 'audience', 'classification'],
                    properties: {
                        sourceIdentity: { type: 'string', minLength: 1, maxLength: 512 },
                        title: { type: 'string', minLength: 1, maxLength: 512 },
                        locator: { type: 'string', minLength: 1, maxLength: 2048 },
                        content: { type: 'string', minLength: 1 },
                        audience: { enum: values.audiences },
                        classification: { enum: values.classifications },
                        version: { type: 'string', maxLength: 64 }
                    }
                }
            }
        }
    },
    activationRequest: {
        type: 'object', additionalProperties: false,
        required: ['corpusCode', 'indexVersion'],
        properties: { corpusCode: identifier, indexVersion: identifier }
    },
    rollbackRequest: {
        type: 'object', additionalProperties: false,
        required: ['corpusCode', 'previousVersion'],
        properties: { corpusCode: identifier, previousVersion: identifier }
    }
};
