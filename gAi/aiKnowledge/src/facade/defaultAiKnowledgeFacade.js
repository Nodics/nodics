/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/facade/DefaultAiKnowledgeFacade
 * @description Delegates secured Knowledge API operations to the owning application service.
 * @layer facade
 * @owner aiKnowledge
 */
module.exports = {
    /** Initializes the facade. */
    init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates ingestion. */
    ingest: request => SERVICE.DefaultAiKnowledgeApiService.ingest(request),
    /** Delegates retrieval. */
    retrieve: request => SERVICE.DefaultAiKnowledgeApiService.retrieve(request),
    /** Delegates activation. */
    activate: request => SERVICE.DefaultAiKnowledgeApiService.activate(request),
    /** Delegates rollback. */
    rollback: request => SERVICE.DefaultAiKnowledgeApiService.rollback(request),
    /** Delegates readiness. */
    readiness: request => SERVICE.DefaultAiKnowledgeApiService.readiness(request),
    /** Delegates ingestion-run listing. */
    listRuns: request => SERVICE.DefaultAiKnowledgeApiService.listRuns(request),
    /** Delegates durable metrics. */
    metrics: request => SERVICE.DefaultAiKnowledgeApiService.metrics(request)
};
