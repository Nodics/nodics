/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/service/api/DefaultAiKnowledgeApiService
 * @description Provides stable response envelopes for secured Knowledge runtime operations.
 * @layer service
 * @owner aiKnowledge
 */
module.exports = {
    /** Builds a Nodics response envelope. */
    response: function (code, data) { return { code: code, data: data }; },
    /** Runs durable candidate ingestion. */
    ingest: async function (request) {
        return this.response('SUC_AIK_00001',
            await SERVICE.DefaultAiKnowledgeOperationsService.ingest(request));
    },
    /** Retrieves active governed evidence. */
    retrieve: async function (request) {
        return this.response('SUC_AIK_00000',
            await SERVICE.DefaultAiKnowledgeOperationsService.retrieve(request));
    },
    /** Activates a candidate. */
    activate: async function (request) {
        return this.response('SUC_AIK_00002',
            await SERVICE.DefaultAiKnowledgeOperationsService.activate(request));
    },
    /** Rolls back a corpus. */
    rollback: async function (request) {
        return this.response('SUC_AIK_00003',
            await SERVICE.DefaultAiKnowledgeOperationsService.rollback(request));
    },
    /** Returns readiness. */
    readiness: async function (request) {
        return this.response('SUC_AIK_00004',
            await SERVICE.DefaultAiKnowledgeOperationsService.readiness(request));
    },
    /** Lists durable ingestion runs. */
    listRuns: async function (request) {
        return this.response('SUC_AIK_00005',
            await SERVICE.DefaultAiKnowledgeOperationsService.runs(request));
    },
    /** Returns bounded metrics. */
    metrics: async function (request) {
        return this.response('SUC_AIK_00006',
            await SERVICE.DefaultAiKnowledgeOperationsService.metrics(request));
    }
};
