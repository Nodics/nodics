/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/service/lifecycle/DefaultAiKnowledgeIndexLifecycleService
 * @description Validates candidate Knowledge versions and atomically changes the corpus-owned active version pointer.
 * @layer service
 * @owner aiKnowledge
 * @override Projects may strengthen candidate checks while preserving corpus pointer and nSearch ownership boundaries.
 */
module.exports = {
    /** Resolves the affected row count from Nodics database adapter result shapes. */
    affectedCount: function (value) {
        const result = value && value.result !== undefined ? value.result : value;
        return Number(result && (result.modifiedCount !== undefined ? result.modifiedCount :
            (result.nModified !== undefined ? result.nModified :
                (result.matchedCount !== undefined ? result.matchedCount : result.n))) || 0);
    },

    /** Activates a non-empty candidate through the aiKnowledge-owned corpus version pointer. */
    activate: async function (input) {
        if (!input.configuration.lifecycle.requireCandidateValidation ||
            !input.configuration.lifecycle.atomicActivationEnabled ||
            !input.configuration.lifecycle.rollbackEnabled) {
            throw new Error('Knowledge activation safety invariants cannot be disabled');
        }
        const chunkService = input.chunkService || SERVICE.DefaultKnowledgeChunkService;
        const corpusService = input.corpusService || SERVICE.DefaultKnowledgeCorpusService;
        const candidate = await chunkService.get({
            tenant: input.tenant, authData: input.authData,
            query: { tenantCode: input.tenant, corpusCode: input.corpusCode, indexVersion: input.indexVersion },
            searchOptions: { pageSize: 1, pageNumber: 1 }
        });
        if (!candidate || !candidate.result || !candidate.result.length) {
            throw new Error('Knowledge candidate index is empty');
        }
        const corpusResponse = await corpusService.get({
            tenant: input.tenant, authData: input.authData,
            query: { tenantCode: input.tenant, corpusCode: input.corpusCode },
            searchOptions: { pageSize: 1, pageNumber: 1 }
        });
        const corpus = corpusResponse && corpusResponse.result && corpusResponse.result[0];
        if (!corpus) {
            throw new Error('Knowledge corpus does not exist');
        }
        const previousVersion = corpus.activeIndexVersion;
        if (previousVersion === input.indexVersion) {
            return { previousVersion: previousVersion, activeVersion: input.indexVersion, replayed: true };
        }
        const updateResult = await corpusService.update({
            tenant: input.tenant, authData: input.authData,
            query: {
                tenantCode: input.tenant,
                corpusCode: input.corpusCode,
                revision: corpus.revision
            },
            model: {
                activeIndexVersion: input.indexVersion,
                state: 'ACTIVE',
                revision: Number(corpus.revision) + 1
            }
        });
        if (this.affectedCount(updateResult) !== 1) {
            const error = new Error('Knowledge activation revision conflict');
            error.code = 'ERR_AIK_00002';
            throw error;
        }
        return { previousVersion: previousVersion, activeVersion: input.indexVersion };
    },

    /** Restores a previously active version through the same optimistic corpus update boundary. */
    rollback: async function (input) {
        if (!input.previousVersion) {
            throw new Error('Knowledge rollback requires a previous version');
        }
        const corpusService = input.corpusService || SERVICE.DefaultKnowledgeCorpusService;
        const corpusResponse = await corpusService.get({
            tenant: input.tenant, authData: input.authData,
            query: { tenantCode: input.tenant, corpusCode: input.corpusCode },
            searchOptions: { pageSize: 1, pageNumber: 1 }
        });
        const corpus = corpusResponse && corpusResponse.result && corpusResponse.result[0];
        if (!corpus) {
            throw new Error('Knowledge corpus does not exist');
        }
        if (corpus.activeIndexVersion === input.previousVersion) {
            return {
                previousVersion: corpus.activeIndexVersion,
                activeVersion: input.previousVersion,
                replayed: true
            };
        }
        const updateResult = await corpusService.update({
            tenant: input.tenant, authData: input.authData,
            query: {
                tenantCode: input.tenant,
                corpusCode: input.corpusCode,
                revision: corpus.revision
            },
            model: {
                activeIndexVersion: input.previousVersion,
                state: 'ACTIVE',
                revision: Number(corpus.revision) + 1
            }
        });
        if (this.affectedCount(updateResult) !== 1) {
            const error = new Error('Knowledge rollback revision conflict');
            error.code = 'ERR_AIK_00002';
            throw error;
        }
        return { previousVersion: corpus.activeIndexVersion, activeVersion: input.previousVersion };
    }
};
