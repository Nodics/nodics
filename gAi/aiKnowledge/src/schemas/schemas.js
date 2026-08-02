/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/src/schemas/schemas
 * @description Defines derived Knowledge corpus, source, document, chunk, and activation authorities.
 * @layer schema
 * @owner aiKnowledge
 * @override Projects may contribute explicit sources while preserving source authority and tenant isolation.
 */
module.exports = {
    aiKnowledge: {
        knowledgeCorpus: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false },
            definition: {
                corpusCode: { type: 'string', required: true }, name: { type: 'string', required: true },
                tenantCode: { type: 'string', required: true }, audience: { type: 'string', required: true },
                locale: { type: 'string', required: false }, activeIndexVersion: { type: 'string', required: false },
                state: { type: 'string', required: true }, revision: { type: 'int', required: true, default: 0 }
            },
            indexes: { common: { tenantCode: { enabled: true, name: 'tenantCode' } }, individual: { corpusCode: { enabled: true, name: 'corpusCode', options: { unique: true } } } }
        },
        knowledgeSource: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false },
            definition: {
                sourceCode: { type: 'string', required: true }, corpusCode: { type: 'string', required: true },
                ownerModule: { type: 'string', required: true }, sourceType: { type: 'string', required: true },
                tenantCode: { type: 'string', required: true }, projection: { type: 'object', required: true },
                synchronizationMode: { type: 'string', required: true }, state: { type: 'string', required: true },
                lastManifestHash: { type: 'string', required: false }
            },
            indexes: { common: { tenantCode: { enabled: true, name: 'tenantCode' }, corpusCode: { enabled: true, name: 'corpusCode' } }, individual: { sourceCode: { enabled: true, name: 'sourceCode', options: { unique: true } } } }
        },
        knowledgeDocument: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                documentCode: { type: 'string', required: true }, corpusCode: { type: 'string', required: true },
                sourceCode: { type: 'string', required: true }, tenantCode: { type: 'string', required: true },
                sourceIdentity: { type: 'string', required: true }, title: { type: 'string', required: true },
                locator: { type: 'string', required: true }, contentHash: { type: 'string', required: true },
                sourceVersion: { type: 'string', required: false }, state: { type: 'string', required: true },
                indexedAt: { type: 'date', required: false }, tombstonedAt: { type: 'date', required: false }
            },
            indexes: { common: { tenantCode: { enabled: true, name: 'tenantCode' }, corpusCode: { enabled: true, name: 'corpusCode' }, sourceCode: { enabled: true, name: 'sourceCode' } }, individual: { documentCode: { enabled: true, name: 'documentCode', options: { unique: true } }, contentHash: { enabled: true, name: 'contentHash' } } }
        },
        knowledgeChunk: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            search: { enabled: true, indexName: 'knowledgeChunk', idPropertyName: 'chunkCode' },
            definition: {
                chunkCode: { type: 'string', required: true }, documentCode: { type: 'string', required: true },
                corpusCode: { type: 'string', required: true }, tenantCode: { type: 'string', required: true },
                sequence: { type: 'int', required: true }, content: { type: 'string', required: true },
                contentHash: { type: 'string', required: true }, tokenEstimate: { type: 'int', required: true },
                title: { type: 'string', required: true }, locator: { type: 'string', required: true },
                section: { type: 'string', required: false }, audience: { type: 'string', required: true },
                classification: { type: 'string', required: true }, indexVersion: { type: 'string', required: true },
                embedding: { type: 'array', required: false }
            },
            indexes: { common: { tenantCode: { enabled: true, name: 'tenantCode' }, corpusCode: { enabled: true, name: 'corpusCode' }, documentCode: { enabled: true, name: 'documentCode' }, indexVersion: { enabled: true, name: 'indexVersion' } }, individual: { chunkCode: { enabled: true, name: 'chunkCode', options: { unique: true } }, contentHash: { enabled: true, name: 'contentHash' } } }
        },
        knowledgeIngestionRun: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                runCode: { type: 'string', required: true }, tenantCode: { type: 'string', required: true },
                corpusCode: { type: 'string', required: true }, sourceCode: { type: 'string', required: true },
                indexVersion: { type: 'string', required: true }, state: { type: 'string', required: true },
                documentCount: { type: 'int', required: true, default: 0 },
                chunkCount: { type: 'int', required: true, default: 0 },
                startedAt: { type: 'date', required: true }, completedAt: { type: 'date', required: false },
                errorCode: { type: 'string', required: false }, errorMessage: { type: 'string', required: false },
                durationMs: { type: 'int', required: false }
            },
            indexes: {
                common: {
                    tenantCode: { enabled: true, name: 'tenantCode' },
                    corpusCode: { enabled: true, name: 'corpusCode' },
                    sourceCode: { enabled: true, name: 'sourceCode' },
                    state: { enabled: true, name: 'state' }
                },
                individual: { runCode: { enabled: true, name: 'runCode', options: { unique: true } } }
            }
        }
    }
};
