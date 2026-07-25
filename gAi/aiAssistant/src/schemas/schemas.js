/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/src/schemas/schemas
 * @description Defines Assistant conversation, message, turn, event, definition, and prompt authorities.
 * @layer schema
 * @owner aiAssistant
 * @override Projects may extend metadata while preserving tenant, principal, sequence, and audit ownership.
 */
module.exports = {
    aiAssistant: {
        assistantDefinition: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false },
            definition: {
                definitionCode: { type: 'string', required: true }, name: { type: 'string', required: true },
                providerProfile: { type: 'string', required: true }, promptCode: { type: 'string', required: true },
                knowledgeCorpusCodes: { type: 'array', required: false }, toolPolicyCode: { type: 'string', required: false },
                enabled: { type: 'bool', required: true, default: false }, revision: { type: 'int', required: true, default: 0 }
            },
            indexes: { individual: { definitionCode: { enabled: true, name: 'definitionCode', options: { unique: true } } } }
        },
        assistantToolPolicy: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false },
            definition: {
                policyCode: { type: 'string', required: true }, contractVersion: { type: 'int', required: true, default: 1 },
                approvedOperations: { type: 'array', required: true },
                enabled: { type: 'bool', required: true, default: false }, revision: { type: 'int', required: true, default: 0 }
            },
            indexes: { individual: { policyCode: { enabled: true, name: 'policyCode', options: { unique: true } } } }
        },
        assistantConversation: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false },
            definition: {
                conversationCode: { type: 'string', required: true }, definitionCode: { type: 'string', required: true },
                tenantCode: { type: 'string', required: true }, enterpriseCode: { type: 'string', required: false },
                applicationCode: { type: 'string', required: false }, principalCode: { type: 'string', required: true },
                title: { type: 'string', required: false }, state: { type: 'string', required: true },
                lastSequence: { type: 'int', required: true, default: 0 }, expiresAt: { type: 'date', required: true },
                archivedAt: { type: 'date', required: false }, revision: { type: 'int', required: true, default: 0 }
            },
            indexes: {
                common: {
                    tenantCode: { enabled: true, name: 'tenantCode' }, principalCode: { enabled: true, name: 'principalCode' },
                    state: { enabled: true, name: 'state' }, expiresAt: { enabled: true, name: 'expiresAt' }
                },
                individual: { conversationCode: { enabled: true, name: 'conversationCode', options: { unique: true } } }
            }
        },
        assistantMessage: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                messageCode: { type: 'string', required: true }, conversationCode: { type: 'string', required: true },
                turnCode: { type: 'string', required: true }, tenantCode: { type: 'string', required: true },
                principalCode: { type: 'string', required: true }, sequence: { type: 'int', required: true },
                role: { type: 'string', required: true }, content: { type: 'string', required: true },
                redactionMetadata: { type: 'object', required: false }, createdAt: { type: 'date', required: true }
            },
            indexes: {
                common: { tenantCode: { enabled: true, name: 'tenantCode' }, conversationCode: { enabled: true, name: 'conversationCode' } },
                individual: { messageCode: { enabled: true, name: 'messageCode', options: { unique: true } }, sequence: { enabled: true, name: 'sequence' } }
            }
        },
        assistantTurn: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                turnCode: { type: 'string', required: true }, conversationCode: { type: 'string', required: true },
                idempotencyKey: { type: 'string', required: true }, tenantCode: { type: 'string', required: true },
                principalCode: { type: 'string', required: true }, state: { type: 'string', required: true },
                configurationSnapshot: { type: 'object', required: true }, providerRequestId: { type: 'string', required: false },
                reservationCode: { type: 'string', required: false }, failureCode: { type: 'string', required: false },
                executionOwner: { type: 'string', required: false }, executionPhase: { type: 'string', required: false },
                leaseExpiresAt: { type: 'date', required: false }, heartbeatAt: { type: 'date', required: false },
                cancellationRequestedAt: { type: 'date', required: false },
                cancellationRequestedBy: { type: 'string', required: false },
                cancellationReason: { type: 'string', required: false },
                acceptedAt: { type: 'date', required: true }, completedAt: { type: 'date', required: false },
                revision: { type: 'int', required: true, default: 0 }
            },
            indexes: {
                common: { tenantCode: { enabled: true, name: 'tenantCode' }, conversationCode: { enabled: true, name: 'conversationCode' }, state: { enabled: true, name: 'state' }, leaseExpiresAt: { enabled: true, name: 'leaseExpiresAt' } },
                individual: { turnCode: { enabled: true, name: 'turnCode', options: { unique: true } }, idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } } }
            }
        },
        assistantTurnEvent: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                eventCode: { type: 'string', required: true }, conversationCode: { type: 'string', required: true },
                turnCode: { type: 'string', required: true }, tenantCode: { type: 'string', required: true },
                sequence: { type: 'int', required: true }, eventType: { type: 'string', required: true },
                data: { type: 'object', required: false }, createdAt: { type: 'date', required: true },
                expiresAt: { type: 'date', required: true }
            },
            indexes: {
                common: { tenantCode: { enabled: true, name: 'tenantCode' }, turnCode: { enabled: true, name: 'turnCode' }, expiresAt: { enabled: true, name: 'expiresAt' } },
                individual: { eventCode: { enabled: true, name: 'eventCode', options: { unique: true } }, sequence: { enabled: true, name: 'sequence' } }
            }
        },
        assistantConfirmation: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                confirmationCode: { type: 'string', required: true },
                tenantCode: { type: 'string', required: true }, principalCode: { type: 'string', required: true },
                conversationCode: { type: 'string', required: true }, turnCode: { type: 'string', required: false },
                operationId: { type: 'string', required: true }, argumentsDigest: { type: 'string', required: true },
                arguments: { type: 'object', required: true }, impact: { type: 'object', required: true },
                state: { type: 'string', required: true }, expiresAt: { type: 'date', required: true },
                approvedAt: { type: 'date', required: false }, consumedAt: { type: 'date', required: false },
                rejectedAt: { type: 'date', required: false },
                rejectionReason: { type: 'string', required: false },
                workflowCode: { type: 'string', required: false }, workflowCarrierCode: { type: 'string', required: false },
                idempotencyKey: { type: 'string', required: true }, revision: { type: 'int', required: true, default: 0 }
            },
            indexes: {
                common: { tenantCode: { enabled: true, name: 'tenantCode' },
                    principalCode: { enabled: true, name: 'principalCode' }, state: { enabled: true, name: 'state' },
                    expiresAt: { enabled: true, name: 'expiresAt' } },
                individual: { confirmationCode: { enabled: true, name: 'confirmationCode', options: { unique: true } },
                    idempotencyKey: { enabled: true, name: 'idempotencyKey', options: { unique: true } } }
            }
        },
        assistantPromptDefinition: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false },
            definition: {
                promptCode: { type: 'string', required: true }, version: { type: 'int', required: true },
                status: { type: 'string', required: true }, instructions: { type: 'string', required: true },
                requiredContextKeys: { type: 'array', required: false }, createdBy: { type: 'string', required: true },
                activatedAt: { type: 'date', required: false }
            },
            indexes: { individual: { promptCode: { enabled: true, name: 'promptCode' }, version: { enabled: true, name: 'version' } } }
        }
    }
};
