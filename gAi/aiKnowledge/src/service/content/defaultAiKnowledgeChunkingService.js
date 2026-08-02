/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/service/content/DefaultAiKnowledgeChunkingService
 * @description Normalizes explicit published documents into deterministic citation-preserving sections.
 * @layer service
 * @owner aiKnowledge
 * @override Projects may replace chunking while preserving content hashes, locators, and source identity.
 */
const crypto = require('crypto');

function hash(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
}

module.exports = {
    /** Chunks one explicit source document at headings and configured token bounds. */
    chunk: function (document, configuration, indexVersion) {
        if (!document.sourceIdentity || !document.title || !document.locator || !document.content) {
            throw new Error('Knowledge document requires source identity, title, locator, and content');
        }
        const maximumCharacters = configuration.chunking.maximumTokens * 3;
        const sections = String(document.content).split(/(?=^#{1,6}\s+)/m).filter(Boolean);
        const chunks = [];
        sections.forEach(section => {
            for (let offset = 0; offset < section.length; offset += maximumCharacters) {
                const content = section.slice(offset, offset + maximumCharacters);
                const sequence = chunks.length;
                const contentHash = hash(content);
                chunks.push({
                    sequence: sequence, content: content, contentHash: contentHash,
                    tokenEstimate: Math.ceil(Buffer.byteLength(content, 'utf8') / 3),
                    title: document.title, locator: document.locator,
                    section: (content.match(/^#{1,6}\s+(.+)$/m) || [])[1],
                    audience: document.audience, classification: document.classification,
                    indexVersion: indexVersion
                });
            }
        });
        return chunks;
    },
    hash: hash
};
