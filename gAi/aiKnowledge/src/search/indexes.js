/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/src/search/indexes
 * @description Contributes the derived Knowledge chunk index to the existing nSearch authority.
 * @layer search
 * @owner aiKnowledge
 * @override Projects may extend indexed projections while preserving source identity and access filters.
 */
module.exports = {
    aiKnowledge: {
        knowledgeChunk: {
            enabled: true,
            schemaName: 'knowledgeChunk',
            indexName: 'knowledgeChunk',
            typeName: 'knowledgeChunk',
            idPropertyName: 'chunkCode',
            capabilities: {
                modes: ['LEXICAL'],
                lexicalFields: ['title', 'content', 'section']
            },
            properties: {
                chunkCode: { enabled: true, type: 'keyword' },
                documentCode: { enabled: true, type: 'keyword' },
                corpusCode: { enabled: true, type: 'keyword' },
                tenantCode: { enabled: true, type: 'keyword' },
                content: { enabled: true, type: 'text' },
                title: { enabled: true, type: 'text' },
                locator: { enabled: true, type: 'keyword' },
                section: { enabled: true, type: 'text' },
                audience: { enabled: true, type: 'keyword' },
                classification: { enabled: true, type: 'keyword' },
                indexVersion: { enabled: true, type: 'keyword' }
            }
        }
    }
};
