/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nPublish/schemas/schemas
 * @description Reserved schema contribution for publish/version promotion models.
 * @layer schema
 * @owner nPublish
 * @override Project modules may add later schemas for customer publishing governance.
 */
module.exports = {
    publish: {
        publicationRequest: {
            super: 'base',
            isVersionedEnabled: false,
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: false
            },
            definition: {
                domain: { type: 'string', required: true, description: 'Owning domain adapter code' },
                rootType: { type: 'string', required: true, description: 'Domain-owned root asset type' },
                rootCode: { type: 'string', required: true, description: 'Domain-owned root asset identity' },
                sourceVersion: { type: 'string', required: true, description: 'Immutable staged source version' },
                targetVersion: { type: 'string', required: false, description: 'Activated Online version' },
                state: { type: 'string', required: true, default: 'STAGED', description: 'Governed generic publication state' },
                revision: { type: 'int', required: true, default: 0, description: 'Optimistic-concurrency revision' },
                auditTrail: { type: 'array', required: true, default: [], description: 'Authoritative immutable transition journal updated atomically with lifecycle state' },
                dependencies: { type: 'array', required: false, description: 'Bounded adapter-resolved dependency identities' },
                validation: { type: 'object', required: false, description: 'Sanitized domain validation result' },
                workflowRef: { type: 'string', required: false, description: 'Existing workflow authority reference' },
                previousOnlineVersion: { type: 'string', required: false, description: 'Rollback target captured before activation' },
                requestedBy: { type: 'string', required: false },
                correlationId: { type: 'string', required: false }
            }
        },
        publicationAudit: {
            super: 'base',
            isVersionedEnabled: false,
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: false
            },
            event: {
                enabled: false
            },
            definition: {
                publicationCode: { type: 'string', required: true },
                fromState: { type: 'string', required: false },
                toState: { type: 'string', required: true },
                revision: { type: 'int', required: true },
                actor: { type: 'string', required: false },
                reason: { type: 'string', required: false },
                details: { type: 'object', required: false, description: 'Sanitized projection of authoritative transition evidence without content payloads or secrets' },
                correlationId: { type: 'string', required: false }
            }
        }
    }
};
