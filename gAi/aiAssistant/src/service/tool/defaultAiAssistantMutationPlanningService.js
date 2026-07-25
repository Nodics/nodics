/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/service/tool/DefaultAiAssistantMutationPlanningService
 * @description Converts a validated provider mutation proposal into clarification or the existing persisted confirmation boundary.
 * @layer service
 * @owner aiAssistant
 * @override Projects may add operation adapters while retaining current-contract resolution, strict input validation, and confirmation authority.
 */
const crypto = require('crypto');
const catalogueService = require('./defaultAiAssistantToolCatalogueService');

const ENTERPRISE_FIELDS = ['code', 'name', 'tenantCode', 'superEnterpriseCode', 'active'];
const IDENTIFIER = /^[A-Za-z][A-Za-z0-9._-]{0,127}$/;

function invalid() {
    return catalogueService.error('AI_ASSISTANT_TOOL_PLAN_INVALID');
}

module.exports = {
    /** Validates the first supported mutation without replacing Profile validation. */
    enterpriseArguments: function (input) {
        if (!input || typeof input !== 'object' || Array.isArray(input) ||
            Object.keys(input).some(key => !ENTERPRISE_FIELDS.includes(key))) throw invalid();
        const missingFields = ['code', 'name'].filter(field =>
            typeof input[field] !== 'string' || !input[field].trim());
        if (missingFields.length) return { missingFields: missingFields };
        if (!IDENTIFIER.test(input.code) || input.name.length > 256 ||
            ['tenantCode', 'superEnterpriseCode'].some(field =>
                input[field] !== undefined && !IDENTIFIER.test(input[field])) ||
            (input.active !== undefined && typeof input.active !== 'boolean')) throw invalid();
        return {
            arguments: ENTERPRISE_FIELDS.reduce((result, field) => {
                if (input[field] !== undefined) result[field] = input[field];
                return result;
            }, {})
        };
    },

    /** Returns only the confirmation fields required by the Axis contract. */
    projection: function (confirmation) {
        return {
            confirmationCode: confirmation.confirmationCode,
            conversationCode: confirmation.conversationCode,
            operationId: confirmation.operationId,
            state: confirmation.state,
            argumentsDigest: confirmation.argumentsDigest,
            revision: confirmation.revision,
            expiresAt: confirmation.expiresAt,
            impact: confirmation.impact,
            workflowCarrierCode: confirmation.workflowCarrierCode
        };
    },

    /** Resolves policy and live contract before creating clarification or confirmation. */
    process: async function (decision, turn, request, runtime) {
        const operation = await catalogueService.resolveMutation(
            decision.plan, runtime.toolPolicy, request, runtime
        );
        if (operation.ownerModule !== 'profile' ||
            operation.operationId !== 'profile_createenterprise') throw invalid();
        const validated = this.enterpriseArguments(decision.plan.arguments);
        if (validated.missingFields) {
            const question = 'Provide the required enterprise information: ' +
                validated.missingFields.join(', ') + '.';
            return {
                eventType: 'CLARIFICATION',
                data: {
                    question: question,
                    missingFields: validated.missingFields,
                    toolId: operation.toolId,
                    ownerModule: operation.ownerModule,
                    operationId: operation.operationId
                },
                text: question
            };
        }
        if (!runtime.confirmationService ||
            typeof runtime.confirmationService.create !== 'function') {
            throw catalogueService.error('AI_ASSISTANT_CONFIRMATION_SERVICE_UNAVAILABLE');
        }
        const idempotencyKey = 'assistant-confirmation-' + crypto.createHash('sha256')
            .update(request.idempotencyKey + '|' + operation.operationId + '|' +
                JSON.stringify(validated.arguments)).digest('hex');
        const response = await runtime.confirmationService.create(Object.assign({}, request, {
            body: {
                conversationCode: turn.conversationCode,
                turnCode: turn.turnCode,
                operationId: operation.operationId,
                arguments: validated.arguments,
                idempotencyKey: idempotencyKey
            }
        }));
        const confirmation = response && response.data && response.data.confirmation;
        if (!confirmation) {
            throw catalogueService.error('AI_ASSISTANT_CONFIRMATION_CREATION_FAILED');
        }
        return {
            eventType: 'CONFIRMATION_REQUIRED',
            data: { confirmation: this.projection(confirmation) },
            text: 'Review and approve the persisted enterprise confirmation before execution.'
        };
    }
};
