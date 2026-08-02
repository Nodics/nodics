/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/service/operations/DefaultAiKnowledgeReadinessService
 * @description Reports configuration, corpus activation, and nSearch readiness without exposing secrets.
 * @layer service
 * @owner aiKnowledge
 */
module.exports = {
    /** Returns fail-closed readiness evidence for one tenant and optional corpus. */
    check: async function (input) {
        const configuration = input.configuration;
        const result = {
            enabled: configuration.enabled === true,
            searchAuthority: configuration.retrieval.searchAuthority,
            searchMode: configuration.retrieval.defaultSearchMode,
            searchReady: false,
            corpusReady: !input.corpusCode,
            ready: false
        };
        if (!result.enabled) {
            result.reason = 'AI Knowledge is disabled by effective configuration';
            return result;
        }
        const searchService = input.searchService || SERVICE.DefaultKnowledgeChunkService;
        try {
            await searchService.doCheckHealth({
                tenant: input.tenant, authData: input.authData,
                moduleName: 'aiKnowledge', indexName: 'knowledgeChunk'
            });
            result.searchReady = true;
        } catch (error) {
            result.reason = 'nSearch knowledgeChunk index is unavailable';
        }
        if (input.corpusCode) {
            const corpusService = input.corpusService || SERVICE.DefaultKnowledgeCorpusService;
            const response = await corpusService.get({
                tenant: input.tenant, authData: input.authData,
                query: {
                    tenantCode: input.tenant, corpusCode: input.corpusCode,
                    state: 'ACTIVE'
                },
                searchOptions: { pageSize: 1, pageNumber: 1 }
            });
            const corpus = response && response.result && response.result[0];
            result.corpusReady = Boolean(corpus && corpus.activeIndexVersion);
            result.activeIndexVersion = result.corpusReady ? corpus.activeIndexVersion : undefined;
            if (!result.corpusReady && !result.reason) {
                result.reason = 'Knowledge corpus has no active index version';
            }
        }
        result.ready = result.searchReady && result.corpusReady;
        return result;
    }
};
