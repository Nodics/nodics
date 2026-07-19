/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner backoffice
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    backoffice: {
        backofficeContractSnapshot: {
            super: 'base',
            accessGroups: { adminGroup: 10, runtimeConfigAdminUserGroup: 10, serviceAccountUserGroup: 10 },
            model: true,
            service: { enabled: true },
            event: { enabled: false },
            router: { enabled: false },
            tenants: ['default'],
            definition: {
                moduleName: { type: 'string', required: true, description: 'Module that owns the observed source contract' },
                contractType: { type: 'string', required: true, description: 'Observed source contract type' },
                contractVersion: { type: 'int', required: true, description: 'Module-declared contract version' },
                contractHash: { type: 'string', required: true, description: 'SHA-256 hash of the normalized observed contract' },
                operations: { type: 'array', required: true, description: 'Bounded normalized operation observations' },
                schemas: { type: 'array', required: true, description: 'Bounded normalized schema-name observations' },
                state: { type: 'string', required: true, description: 'DISCOVERED, ACTIVE, PENDING_APPROVAL, REJECTED, or SUPERSEDED lifecycle state' },
                changeClassification: { type: 'string', required: true, description: 'Classified impact relative to the active snapshot' },
                revision: { type: 'int', required: true, default: 0, description: 'Optimistic-concurrency revision for snapshot decisions' },
                discoveredAt: { type: 'date', required: true, description: 'Time the normalized observation was discovered' },
                decidedAt: { type: 'date', required: false, description: 'Time an administrator approved or rejected the candidate' },
                decidedBy: { type: 'string', required: false, description: 'Authenticated principal that made the decision' },
                decisionReason: { type: 'string', required: false, description: 'Bounded administrator decision reason' },
                sourceInstanceId: { type: 'string', required: false, description: 'Observed runtime instance without credentials or topology secrets' }
            },
            indexes: {
                individual: {
                    snapshotHash: { name: 'contractHash', enabled: true, options: { unique: false } },
                    snapshotModule: { name: 'moduleName', enabled: true, options: { unique: false } },
                    snapshotState: { name: 'state', enabled: true, options: { unique: false } }
                }
            }
        },
        backofficeContractActivation: {
            super: 'base',
            accessGroups: { adminGroup: 10, runtimeConfigAdminUserGroup: 10, serviceAccountUserGroup: 10 },
            model: true,
            service: { enabled: true },
            event: { enabled: false },
            router: { enabled: false },
            tenants: ['default'],
            definition: {
                moduleName: { type: 'string', required: true, description: 'Module whose active observed contract is selected' },
                activeHash: { type: 'string', required: true, description: 'Hash of the active normalized snapshot' },
                previousHash: { type: 'string', required: false, description: 'Previously active hash retained for audit and rollback context' },
                revision: { type: 'int', required: true, default: 0, description: 'Compare-and-set revision used across BackOffice replicas' },
                activatedAt: { type: 'date', required: true, description: 'Time this active selection was written' },
                activatedBy: { type: 'string', required: false, description: 'Authenticated principal or discovery agent that selected the snapshot' },
                activationReason: { type: 'string', required: false, description: 'Bounded activation or rollback reason' }
            },
            indexes: {
                individual: {
                    activationModule: { name: 'moduleName', enabled: true, options: { unique: true } }
                }
            }
        }
    }
};
