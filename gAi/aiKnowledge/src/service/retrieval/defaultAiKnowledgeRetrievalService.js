/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/service/retrieval/DefaultAiKnowledgeRetrievalService
 * @description Delegates retrieval to nSearch and returns tenant/audience-filtered evidence with citations.
 * @layer service
 * @owner aiKnowledge
 * @override Projects may add reranking while preserving nSearch authority and citations.
 */
const contractValues = require('../../utils/contractValues');

module.exports = {
    /** Classifies only safe same-application paths as navigable citation targets. */
    citationNavigation: function (locator) {
        const controlCharacter = typeof locator === 'string' &&
            Array.from(locator).some(character => {
                const code = character.charCodeAt(0);
                return code <= 31 || code === 127;
            });
        if (typeof locator !== 'string' || !locator.startsWith('/') ||
            locator.startsWith('//') || locator.includes('\\') || controlCharacter) {
            return { navigationType: 'NONE' };
        }
        return { navigationType: 'INTERNAL_ROUTE', navigationTarget: locator };
    },
    /** Creates a status-aware Nodics error while remaining directly unit-testable. */
    error: function (code, message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) {
            return new CLASSES.NodicsError(code, message);
        }
        const error = new Error(message);
        error.code = code;
        return error;
    },

    /** Performs indexed retrieval and refuses when governed evidence is insufficient. */
    retrieve: async function (input) {
        const configuration = input.configuration;
        if (configuration.retrieval.searchAuthority !== 'nSearch') {
            throw new Error('Knowledge retrieval authority must remain nSearch');
        }
        if (!input.corpusCode || !input.audience ||
            !Array.isArray(input.allowedClassifications) || !input.allowedClassifications.length) {
            throw this.error('ERR_AIK_00004',
                'Knowledge retrieval requires corpus, audience, and classifications');
        }
        if (typeof input.query !== 'string' || !input.query.trim() || input.query.length > 8000 ||
            !contractValues.audiences.includes(input.audience) ||
            input.allowedClassifications.some(value => !contractValues.classifications.includes(value)) ||
            new Set(input.allowedClassifications).size !== input.allowedClassifications.length ||
            input.scope && input.scope.tenant && input.scope.tenant !== input.tenant) {
            throw this.error('ERR_AIK_00004',
                'Knowledge retrieval scope or contract values are invalid');
        }
        if (input.maximumResults !== undefined &&
            (!Number.isInteger(input.maximumResults) || input.maximumResults < 1 || input.maximumResults > 100)) {
            throw this.error('ERR_AIK_00004', 'Knowledge retrieval maximum results is invalid');
        }
        const search = input.searchService || SERVICE.DefaultKnowledgeChunkService;
        const corpusService = input.corpusService || SERVICE.DefaultKnowledgeCorpusService;
        const corpusResponse = await corpusService.get({
            tenant: input.tenant,
            authData: input.authData,
            query: {
                tenantCode: input.tenant,
                corpusCode: input.corpusCode,
                state: 'ACTIVE'
            },
            searchOptions: { pageSize: 1, pageNumber: 1 }
        });
        const corpus = corpusResponse && corpusResponse.result && corpusResponse.result[0];
        if (!corpus || !corpus.activeIndexVersion) {
            const error = new Error('Knowledge corpus has no active index version');
            error.code = 'ERR_AIK_00001';
            throw error;
        }
        const mode = String(input.mode || configuration.retrieval.defaultMode || 'INDEXED').toUpperCase();
        if (mode !== 'INDEXED') {
            throw new Error('Knowledge retrieval strategy is not implemented: ' + mode);
        }
        const searchMode = String(input.searchMode ||
            configuration.retrieval.defaultSearchMode || 'LEXICAL').toUpperCase();
        if (!configuration.retrieval.allowedSearchModes.includes(searchMode)) {
            throw new Error('Knowledge search mode is not enabled: ' + searchMode);
        }
        const maximum = Math.min(input.maximumResults || configuration.retrieval.maximumResults,
            configuration.retrieval.maximumResults);
        const response = await search.doSearch({
            tenant: input.tenant, authData: input.authData, moduleName: 'aiKnowledge',
            indexName: 'knowledgeChunk',
            searchRequest: {
                mode: searchMode,
                text: input.query,
                fields: ['title', 'content', 'section'],
                filters: {
                    tenantCode: input.tenant,
                    corpusCode: input.corpusCode,
                    audience: input.audience,
                    classification: input.allowedClassifications,
                    indexVersion: corpus.activeIndexVersion
                },
                size: maximum
            },
        });
        const rawResult = response && response.result !== undefined ? response.result : response;
        const hits = rawResult && rawResult.hits && rawResult.hits.hits;
        const values = Array.isArray(hits) ? hits.map(hit =>
            Object.assign({ score: hit._score }, hit._source || {})) :
            (Array.isArray(rawResult) ? rawResult : []);
        const evidence = values.filter(value => Number(value.score || 0) >=
            configuration.retrieval.minimumEvidenceScore).map(value => ({
            evidenceId: value.chunkCode, documentId: value.documentCode, chunkId: value.chunkCode,
            score: Number(value.score), content: value.content,
            citation: Object.assign({
                citationId: value.chunkCode, documentId: value.documentCode,
                sourceId: value.sourceCode || input.corpusCode, title: value.title,
                locator: value.locator, section: value.section, version: value.indexVersion
            }, this.citationNavigation(value.locator))
        }));
        return {
            contractVersion: 1, mode: mode, searchMode: searchMode, evidence: evidence,
            sufficientEvidence: evidence.length > 0,
            insufficiencyReason: evidence.length ? undefined : 'No governed evidence met the configured score'
        };
    }
};
