/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module aiKnowledge/service/operations/DefaultAiKnowledgeOperationsService
 * @description Orchestrates durable ingestion status, lifecycle, retrieval, readiness, and diagnostics.
 * @layer service
 * @owner aiKnowledge
 */
module.exports = {
    /** Removes common credential-shaped values before persisting failure diagnostics. */
    sanitizeError: function (error) {
        return String(error && error.message || 'Knowledge ingestion failed')
            .replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
            .slice(0, 1000);
    },

    /** Returns the effective configuration and rejects runtime work while disabled. */
    configuration: function () {
        const configuration = CONFIG.get('aiKnowledge') || {};
        if (configuration.enabled !== true) {
            const error = new Error('AI Knowledge is disabled');
            error.code = 'ERR_AIK_00000';
            throw error;
        }
        return configuration;
    },

    /** Produces a stable run identity when the caller does not supply an idempotency key. */
    runCode: function (request) {
        const body = request.body || {};
        return body.runCode || request.idempotencyKey ||
            crypto.randomBytes(16).toString('hex');
    },

    /** Ingests one bounded candidate and durably records success or sanitized failure. */
    ingest: async function (request) {
        const configuration = this.configuration();
        const body = request.body || {};
        const runCode = this.runCode(request);
        const startedAt = new Date();
        const runService = request.runService || SERVICE.DefaultKnowledgeIngestionRunService;
        const ingestionService = request.ingestionService || SERVICE.DefaultAiKnowledgeIngestionService;
        const existingResponse = await runService.get({
            tenant: request.tenant, authData: request.authData,
            query: { tenantCode: request.tenant, runCode: runCode },
            searchOptions: { pageSize: 1, pageNumber: 1 }
        });
        const existing = existingResponse && existingResponse.result && existingResponse.result[0];
        if (existing) {
            if (existing.state === 'COMPLETED') {
                return {
                    runCode: runCode, state: existing.state, replayed: true,
                    result: { indexVersion: existing.indexVersion,
                        documents: existing.documentCount, chunks: existing.chunkCount }
                };
            }
            const conflict = new Error('Knowledge ingestion run already exists in state: ' + existing.state);
            conflict.code = 'ERR_AIK_00002';
            throw conflict;
        }
        const model = {
            code: runCode, active: true, runCode: runCode, tenantCode: request.tenant,
            corpusCode: body.source.corpusCode, sourceCode: body.source.sourceCode,
            indexVersion: body.indexVersion, state: 'RUNNING',
            documentCount: 0, chunkCount: 0, startedAt: startedAt
        };
        await runService.save({ tenant: request.tenant, authData: request.authData, model: model });
        try {
            const result = await ingestionService.ingest({
                tenant: request.tenant, authData: request.authData,
                configuration: configuration, source: body.source,
                documents: body.documents, indexVersion: body.indexVersion,
                runCode: runCode, configurationRevision: body.configurationRevision,
                services: request.services,
                providerConfiguration: CONFIG.get('aiProviders') || {},
                providerGateway: body.embed === true ?
                    (request.providerGateway || SERVICE.DefaultAiProviderGatewayService) : undefined
            });
            await runService.update({
                tenant: request.tenant, authData: request.authData, query: { runCode: runCode },
                model: {
                    state: 'COMPLETED', documentCount: result.documents, chunkCount: result.chunks,
                    completedAt: new Date(), durationMs: Date.now() - startedAt.getTime()
                }
            });
            return { runCode: runCode, state: 'COMPLETED', result: result };
        } catch (error) {
            await runService.update({
                tenant: request.tenant, authData: request.authData, query: { runCode: runCode },
                model: {
                    state: 'FAILED', completedAt: new Date(),
                    durationMs: Date.now() - startedAt.getTime(),
                    errorCode: error.code || 'ERR_AIK_00004',
                    errorMessage: this.sanitizeError(error)
                }
            });
            throw error;
        }
    },

    /** Activates a validated candidate version. */
    activate: function (request) {
        return SERVICE.DefaultAiKnowledgeIndexLifecycleService.activate(Object.assign(
            {}, request, request.body || {}, { configuration: this.configuration() }
        ));
    },

    /** Rolls a corpus back to an explicitly supplied previous version. */
    rollback: function (request) {
        return SERVICE.DefaultAiKnowledgeIndexLifecycleService.rollback(Object.assign(
            {}, request, request.body || {}, { configuration: this.configuration() }
        ));
    },

    /** Retrieves active, tenant-isolated evidence. */
    retrieve: function (request) {
        const body = request.body || {};
        const scope = body.scope || {};
        return SERVICE.DefaultAiKnowledgeRetrievalService.retrieve(Object.assign(
            {}, request, body, {
                corpusCode: body.corpusCode,
                audience: body.audience || scope.audience,
                scope: scope,
                allowedClassifications: body.allowedClassifications ||
                    (scope.classification ? [scope.classification] : []),
                configuration: this.configuration()
            }
        ));
    },

    /** Returns readiness without throwing merely because the feature is disabled. */
    readiness: function (request) {
        return SERVICE.DefaultAiKnowledgeReadinessService.check(Object.assign({}, request, {
            corpusCode: (request.query || {}).corpusCode,
            configuration: CONFIG.get('aiKnowledge') || {}
        }));
    },

    /** Lists bounded durable ingestion runs for the active tenant. */
    runs: function (request) {
        const query = request.query || {};
        const limit = Math.min(Math.max(Number(query.limit || 50), 1), 200);
        return SERVICE.DefaultKnowledgeIngestionRunService.get({
            tenant: request.tenant, authData: request.authData,
            query: {
                tenantCode: request.tenant,
                ...(query.corpusCode ? { corpusCode: query.corpusCode } : {}),
                ...(query.state ? { state: query.state } : {})
            },
            searchOptions: { pageSize: limit, pageNumber: Math.max(Number(query.page || 1), 1) }
        });
    },

    /** Aggregates bounded process-independent metrics from durable ingestion runs. */
    metrics: async function (request) {
        const response = await this.runs(Object.assign({}, request, {
            query: Object.assign({}, request.query || {}, { limit: 200, page: 1 })
        }));
        const runs = response && response.result || [];
        const totals = runs.reduce((result, run) => {
            result.runs++;
            result.documents += Number(run.documentCount || 0);
            result.chunks += Number(run.chunkCount || 0);
            result.byState[run.state] = (result.byState[run.state] || 0) + 1;
            result.totalDurationMs += Number(run.durationMs || 0);
            return result;
        }, { runs: 0, documents: 0, chunks: 0, totalDurationMs: 0, byState: {} });
        totals.averageDurationMs = totals.runs ? Math.round(totals.totalDurationMs / totals.runs) : 0;
        return totals;
    }
};
