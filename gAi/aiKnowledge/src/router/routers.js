/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
const contracts = require('../schemas/apiContracts');

module.exports = {
    aiKnowledge: {
        internal: {
            ingest: {
                secured: true, accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/internal/knowledge/ingest', method: 'POST',
                controller: 'DefaultAiKnowledgeController', operation: 'ingest',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.ingestionRequest } } },
                responses: { '200': { description: 'Durably tracked Knowledge candidate ingestion completed' } }
            },
            retrieve: {
                secured: true, accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal', key: '/internal/knowledge/retrieve', method: 'POST',
                controller: 'DefaultAiKnowledgeController', operation: 'retrieve',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.retrievalRequest } } },
                responses: { '200': { description: 'Active-version governed evidence and citations' } }
            }
        },
        operations: {
            activate: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.knowledge.manage',
                apiExposure: 'aiOperations', key: '/operations/knowledge/activate', method: 'POST',
                controller: 'DefaultAiKnowledgeController', operation: 'activate',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.activationRequest } } },
                responses: { '200': { description: 'Validated candidate version activated atomically' } }
            },
            rollback: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.knowledge.manage',
                apiExposure: 'aiOperations', key: '/operations/knowledge/rollback', method: 'POST',
                controller: 'DefaultAiKnowledgeController', operation: 'rollback',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.rollbackRequest } } },
                responses: { '200': { description: 'Corpus restored to an explicitly selected previous version' } }
            },
            readiness: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.knowledge.read',
                apiExposure: 'aiOperations', key: '/operations/knowledge/readiness', method: 'GET',
                controller: 'DefaultAiKnowledgeController', operation: 'readiness',
                help: { parameters: [{ name: 'corpusCode', in: 'query', required: false, schema: { type: 'string' } }] },
                responses: { '200': { description: 'Sanitized Knowledge and nSearch readiness evidence' } }
            },
            runs: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.knowledge.read',
                apiExposure: 'aiOperations', key: '/operations/knowledge/ingestion-runs', method: 'GET',
                controller: 'DefaultAiKnowledgeController', operation: 'listRuns',
                responses: { '200': { description: 'Bounded tenant-isolated Knowledge ingestion runs' } }
            },
            metrics: {
                secured: true, accessGroups: ['userGroup'], permission: 'ai.knowledge.read',
                apiExposure: 'aiOperations', key: '/operations/knowledge/metrics', method: 'GET',
                controller: 'DefaultAiKnowledgeController', operation: 'metrics',
                responses: { '200': { description: 'Durable bounded Knowledge operational metrics' } }
            }
        }
    }
};
