/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/service/ingestion/DefaultAiKnowledgeIngestionService
 * @description Ingests explicit authoritative documents through generated services and nSearch-owned indexing.
 * @layer service
 * @owner aiKnowledge
 * @override Projects may contribute source adapters while preserving explicit projection and candidate activation.
 */
const chunkingService = require('../content/defaultAiKnowledgeChunkingService');
const contractValues = require('../../utils/contractValues');

module.exports = {
    /** Ingests a documentation-only candidate version without reading temporary root docs. */
    ingest: async function (input) {
        const configuration = input.configuration;
        if (!input.source || !input.source.sourceCode || !input.source.corpusCode ||
            !input.indexVersion || !Array.isArray(input.documents) || !input.documents.length) {
            throw new Error('Knowledge ingestion requires source, index version, and documents');
        }
        if (input.documents.length > configuration.ingestion.maximumDocumentsPerRun) {
            throw new Error('Knowledge ingestion document limit exceeded');
        }
        if (configuration.sourcePolicy.excludeTemporaryRootDocs !== true) {
            throw new Error('Knowledge temporary root docs exclusion cannot be disabled');
        }
        if (!configuration.sourcePolicy.allowedSourceTypes.includes(input.source.sourceType)) {
            throw new Error('Knowledge source type is not allowed');
        }
        if (!contractValues.sourceTypes.includes(input.source.sourceType) ||
            input.documents.some(document =>
                !contractValues.audiences.includes(document.audience) ||
                !contractValues.classifications.includes(document.classification))) {
            throw new Error('Knowledge source or document contract values are invalid');
        }
        if (input.source.path &&
            /(^|[/\\])docs([/\\]|$)/.test(input.source.path) &&
            !/(^|[/\\])nodicsdocs([/\\]|$)/.test(input.source.path)) {
            throw new Error('Temporary root docs cannot be a Knowledge source');
        }
        const services = input.services || {
            documents: SERVICE.DefaultKnowledgeDocumentService,
            chunks: SERVICE.DefaultKnowledgeChunkService,
            search: SERVICE.DefaultKnowledgeChunkService
        };
        const indexVersion = input.indexVersion;
        const saved = [];
        for (const document of input.documents) {
            if (!document.content ||
                Buffer.byteLength(document.content, 'utf8') > configuration.ingestion.maximumDocumentBytes) {
                throw new Error('Knowledge document content is empty or exceeds the configured byte limit');
            }
            const documentCode = chunkingService.hash(input.source.sourceCode + '|' + document.sourceIdentity);
            const contentHash = chunkingService.hash(document.content);
            const documentModel = {
                code: documentCode, active: true, documentCode: documentCode,
                corpusCode: input.source.corpusCode, sourceCode: input.source.sourceCode,
                tenantCode: input.tenant, sourceIdentity: document.sourceIdentity,
                title: document.title, locator: document.locator, contentHash: contentHash,
                sourceVersion: document.version, state: 'CANDIDATE'
            };
            if (typeof services.documents.get === 'function' &&
                typeof services.documents.update === 'function') {
                const existing = await services.documents.get({
                    tenant: input.tenant, authData: input.authData,
                    query: { tenantCode: input.tenant, documentCode: documentCode },
                    searchOptions: { pageSize: 1, pageNumber: 1 }
                });
                if (existing && existing.result && existing.result.length) {
                    await services.documents.update({
                        tenant: input.tenant, authData: input.authData,
                        query: { tenantCode: input.tenant, documentCode: documentCode },
                        model: documentModel
                    });
                } else {
                    await services.documents.save({
                        tenant: input.tenant, authData: input.authData, model: documentModel
                    });
                }
            } else {
                await services.documents.save({
                    tenant: input.tenant, authData: input.authData, model: documentModel
                });
            }
            const chunks = chunkingService.chunk(document, configuration, indexVersion);
            let embeddings = [];
            if (input.providerGateway && chunks.length) {
                const embedded = await input.providerGateway.execute(
                    configuration.embeddingProfile, 'embed',
                    { inputs: chunks.map(chunk => chunk.content), cacheEligible: true },
                    {
                        tenant: input.tenant, principalCode: input.authData && input.authData.loginId,
                        idempotencyKey: input.runCode + ':' + documentCode,
                        configurationRevision: input.configurationRevision,
                        tokenLedger: input.tokenLedger, rateLimitCache: input.rateLimitCache,
                        reuseCache: input.reuseCache, secretResolver: input.secretResolver
                    },
                    input.providerConfiguration
                );
                embeddings = embedded.embeddings || [];
                if (embeddings.length !== chunks.length) {
                    throw new Error('Knowledge embedding count does not match candidate chunks');
                }
            }
            for (const chunk of chunks) {
                const chunkCode = chunkingService.hash(
                    documentCode + '|' + indexVersion + '|' + chunk.sequence + '|' + chunk.contentHash
                );
                const model = Object.assign({
                    code: chunkCode, active: true, chunkCode: chunkCode,
                    documentCode: documentCode, corpusCode: input.source.corpusCode,
                    tenantCode: input.tenant
                }, chunk);
                if (embeddings[chunk.sequence]) model.embedding = embeddings[chunk.sequence];
                await services.chunks.save({ tenant: input.tenant, authData: input.authData, model: model });
                const indexResult = await services.search.doSave({
                    tenant: input.tenant, authData: input.authData, moduleName: 'aiKnowledge',
                    indexName: 'knowledgeChunk', model: model
                });
                if (indexResult && Array.isArray(indexResult.errors) && indexResult.errors.length) {
                    const error = new Error('Knowledge chunk indexing failed');
                    error.code = 'ERR_AIK_00004';
                    error.causes = indexResult.errors;
                    throw error;
                }
                saved.push(model);
            }
        }
        if (saved.length && typeof services.search.doRefresh === 'function') {
            await services.search.doRefresh({
                tenant: input.tenant,
                authData: input.authData,
                moduleName: 'aiKnowledge',
                indexName: 'knowledgeChunk'
            });
        }
        return { indexVersion: indexVersion, documents: input.documents.length, chunks: saved.length };
    }
};
