/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/config/properties
 * @description Defines fail-closed, layered defaults for reusable Knowledge ingestion and retrieval.
 * @layer config
 * @owner aiKnowledge
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    aiKnowledge: {
        contractVersion: 1,
        enabled: false,
        configuration: {
            rejectUnknownKeys: true,
            snapshotEnabled: true,
            exposeOriginDiagnostics: true
        },
        sourcePolicy: {
            allowedSourceTypes: ['PARTNER_DOCUMENTATION'],
            excludeTemporaryRootDocs: true,
            requireExplicitModelProjection: true,
            allowGenericSchemaDiscovery: false,
            allowDirectDatabaseRead: false
        },
        retrieval: {
            defaultMode: 'INDEXED',
            defaultSearchMode: 'LEXICAL',
            allowedSearchModes: ['LEXICAL'],
            searchAuthority: 'nSearch',
            maximumResults: 10,
            minimumEvidenceScore: 0.5,
            requireCitations: true,
            insufficientEvidenceMode: 'REFUSE'
        },
        chunking: {
            strategy: 'SECTION',
            maximumTokens: 800,
            overlapTokens: 80
        },
        embeddingProfile: 'knowledgeEmbedding',
        evidenceOptimization: {
            enabled: true,
            deduplicateEvidence: true,
            rerankBeforeBudgeting: true,
            maximumEvidenceTokens: 10000,
            preserveCitations: true,
            preserveSourceIdentity: true
        },
        embeddingOptimization: {
            enabled: true,
            contentHashDeduplication: true,
            skipUnchangedContent: true,
            batchEnabled: true,
            maximumBatchTokens: 50000
        },
        lifecycle: {
            incrementalSyncEnabled: true,
            tombstoneEnabled: true,
            requireCandidateValidation: true,
            atomicActivationEnabled: true,
            rollbackEnabled: true
        },
        ingestion: {
            maximumDocumentsPerRun: 1000,
            maximumDocumentBytes: 1048576,
            requireContentHash: true,
            candidateIndexPrefix: 'knowledge-candidate'
        },
        security: {
            enforceTenantIsolation: true,
            enforceAudienceIsolation: true,
            enforceClassification: true,
            allowWritesFromRetrieval: false,
            allowInlineSecrets: false
        }
    }
};
