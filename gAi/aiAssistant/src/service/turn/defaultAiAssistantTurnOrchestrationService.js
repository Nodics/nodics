/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/service/turn/DefaultAiAssistantTurnOrchestrationService
 * @description Runs the bounded read-only Assistant turn pipeline over owned conversation, Knowledge, and aiProviders contracts.
 * @layer service
 * @owner aiAssistant
 * @override Projects may replace orchestration while preserving identity, snapshot, ledger, evidence, and event boundaries.
 */
const crypto = require('crypto');
const configurationService = require('../config/defaultAiAssistantConfigurationService');
const guardrailService = require('../security/defaultAiAssistantGuardrailService');
const contextService = require('../context/defaultAiAssistantContextService');
const knowledgeContextService = require('../context/defaultAiAssistantKnowledgeContextService');
const conversationService = require('../conversation/defaultAiAssistantConversationService');
const executionLeaseService = require('./defaultAiAssistantTurnExecutionLeaseService');
const executionTelemetry = require('../observability/defaultAiAssistantExecutionTelemetryService');
const toolPlanningService = require('../tool/defaultAiAssistantToolPlanningService');
const mutationPlanningService = require('../tool/defaultAiAssistantMutationPlanningService');

function items(result) {
    return result && Array.isArray(result.result) ? result.result : [];
}

function affected(response) {
    const result = response && response.result !== undefined ? response.result : response;
    if (!result) return 0;
    if (Array.isArray(result)) return result.length;
    return Number(result.modifiedCount || result.nModified || result.matchedCount || result.n || 0);
}

function cancellationError(reason) {
    const error = new Error(reason || 'Employee requested cancellation');
    error.code = 'EMPLOYEE_CANCELLED';
    return error;
}

module.exports = {
    /** Validates and durably accepts a turn before asynchronous execution begins. */
    prepare: async function (request, runtime) {
        const configuration = runtime.configuration;
        configurationService.validate(configuration);
        if (configuration.enabled !== true) throw new Error('AI Assistant is disabled');
        if (!request.idempotencyKey || String(request.message || '').length >
            configuration.guardrails.maximumMessageCharacters) {
            throw new Error('AI Assistant message identity or size is invalid');
        }
        const identity = guardrailService.authorize(request);
        const context = {
            identity: identity, configuration: configuration,
            services: runtime.services, eventPublisher: runtime.eventPublisher
        };
        const snapshot = configurationService.snapshot(configuration, runtime.configurationOrigins);
        const redacted = guardrailService.redact(request.message, configuration);
        let conversation = request.conversationCode ?
            await conversationService.getOwned(request.conversationCode, request, context) :
            await conversationService.create(request, configuration, context);
        const turn = await conversationService.acceptTurn(conversation, request, snapshot, redacted, context);
        return {
            configuration: configuration, identity: identity, context: context,
            snapshot: snapshot, redacted: redacted, conversation: conversation, turn: turn
        };
    },

    /** Executes one previously accepted turn and persists terminal state plus normalized evidence. */
    executePrepared: async function (prepared, request, runtime) {
        const configuration = prepared.configuration;
        const identity = prepared.identity;
        const context = prepared.context;
        const redacted = prepared.redacted;
        const conversation = prepared.conversation;
        const turn = prepared.turn;
        if (turn.state !== 'ACCEPTED') return { conversation: conversation, turn: turn };
        const lease = await executionLeaseService.claimAccepted(turn, request, runtime);
        if (!lease) return { conversation: conversation, turn: turn, executionClaimed: false };
        const heartbeat = executionLeaseService.heartbeat(lease, request, runtime, reason => {
            if (request.executionController && !request.executionController.signal.aborted) {
                executionTelemetry.record('cancellationSignals');
                request.executionController.abort(cancellationError(reason));
            }
        });
        turn.state = 'PROCESSING';
        let executionPhase = 'PROMPT';
        try {
            const services = conversationService.services(context);
            const prompts = items(await runtime.promptService.get({
                tenant: identity.tenantCode, authData: request.authData,
                query: { promptCode: request.promptCode, status: 'ACTIVE' },
                searchOptions: { pageSize: 1, pageNumber: 1, sort: { version: -1 } }
            }));
            if (!prompts.length) throw new Error('AI Assistant approved prompt was not found');
            const messages = items(await services.messages.get({
                tenant: identity.tenantCode, authData: request.authData,
                query: { tenantCode: identity.tenantCode, conversationCode: conversation.conversationCode },
                searchOptions: { pageSize: configuration.contextOptimization.maximumHistoryTokens, pageNumber: 1, sort: { sequence: 1 } }
            }));
            const history = contextService.optimizeHistory(messages.slice(0, -1), configuration);
            let knowledgeContext = knowledgeContextService.empty();
            if (request.knowledge) {
                await conversationService.appendEvent(turn, 'STATUS', {
                    phase: 'KNOWLEDGE_RETRIEVAL'
                }, request, context);
                knowledgeContext = await knowledgeContextService.retrieve({
                    knowledge: request.knowledge,
                    identity: identity,
                    authData: request.authData,
                    knowledgeOperations: runtime.knowledgeOperations
                });
            }
            if (request.knowledge && !knowledgeContext.sufficientEvidence) {
                const error = new Error('AI Assistant refused because governed evidence is insufficient');
                error.code = 'INSUFFICIENT_EVIDENCE';
                throw error;
            }
            executionPhase = 'TOOL_CATALOGUE';
            const tools = configuration.tools.enabled === true && runtime.toolPolicy ?
                await toolPlanningService.tools(runtime.toolPolicy, request, runtime) : [];
            const planningEnabled = tools.length > 0;
            const providerInput = contextService.assemble({
                instructions: prompts[0].instructions +
                    (planningEnabled ? '\n\n' + toolPlanningService.instructions(tools) : ''),
                history: history,
                message: redacted.content, evidence: knowledgeContext.evidence,
                knowledgeContext: knowledgeContext,
                knowledgeInstructions: knowledgeContextService.providerInstructions(knowledgeContext),
                authorization: { permissions: request.authData.permissions || [] }, tools: tools
            });
            executionPhase = 'PROVIDER';
            await executionLeaseService.renew(lease, request, runtime, 'PROVIDER');
            if (lease.cancellationRequested) throw cancellationError(lease.cancellationReason);
            await conversationService.appendEvent(turn, 'STATUS', { phase: 'PROVIDER' }, request, context);
            let pendingDelta = '';
            let streamedFinal = false;
            const providerContext = suffix => ({
                tenant: identity.tenantCode, enterpriseCode: identity.enterpriseCode,
                applicationCode: identity.applicationCode, principalCode: identity.principalCode,
                idempotencyKey: request.idempotencyKey + ':' + suffix,
                configurationRevision: runtime.configurationRevision,
                tokenLedger: runtime.tokenLedger, rateLimitCache: runtime.rateLimitCache,
                secretResolver: runtime.secretResolver, correlationId: request.correlationId,
                signal: request.signal
            });
            const streamingContext = Object.assign(providerContext('answer'),
                runtime.streamingProviderEvents ? {
                    onProviderEvent: event => {
                        if (event && event.type === 'TEXT_DELTA' && event.text) {
                            streamedFinal = true;
                            pendingDelta += event.text;
                            if (pendingDelta.length >= configuration.streaming.deltaBatchCharacters) {
                                const text = pendingDelta;
                                pendingDelta = '';
                                return conversationService.appendEvent(turn, 'TEXT_DELTA', {
                                    text: text
                                }, request, context);
                            }
                        }
                    }
                } : {});
            let result = await runtime.providerGateway.execute(
                configuration.providerProfile, 'generate',
                {
                    messages: providerInput.messages,
                    instructions: providerInput.instructions,
                    maximumOutputTokens: request.maximumOutputTokens
                },
                planningEnabled ? providerContext('plan') : streamingContext,
                runtime.providerConfiguration
            );
            let publishFinalUsage = true;
            let finalUsagePhase = planningEnabled ? 'ANSWER' : 'GENERATION';
            if (planningEnabled) {
                const decision = toolPlanningService.parse(result.text, configuration);
                if (decision.type === 'ANSWER') {
                    result = Object.assign({}, result, { text: decision.answer });
                } else if (decision.type === 'CLARIFICATION') {
                    finalUsagePhase = 'PLANNING';
                    await conversationService.appendEvent(turn, 'CLARIFICATION', {
                        question: decision.question,
                        missingFields: decision.missingFields
                    }, request, context);
                    result = Object.assign({}, result, {
                        text: decision.question
                    });
                } else if (decision.type === 'MUTATION_PROPOSAL') {
                    publishFinalUsage = false;
                    executionPhase = 'MUTATION_PROPOSAL';
                    await conversationService.appendEvent(turn, 'USAGE', {
                        phase: 'PLANNING',
                        usage: result.usage,
                        reconciliation: result.usageReconciliation
                    }, request, context);
                    await executionLeaseService.renew(
                        lease, request, runtime, 'MUTATION_PROPOSAL'
                    );
                    if (lease.cancellationRequested) {
                        throw cancellationError(lease.cancellationReason);
                    }
                    const proposal = await mutationPlanningService.process(
                        decision, turn, request, runtime
                    );
                    await conversationService.appendEvent(
                        turn, proposal.eventType, proposal.data, request, context
                    );
                    result = Object.assign({}, result, { text: proposal.text });
                } else {
                    executionPhase = 'TOOL';
                    await conversationService.appendEvent(turn, 'USAGE', {
                        phase: 'PLANNING',
                        usage: result.usage,
                        reconciliation: result.usageReconciliation
                    }, request, context);
                    await executionLeaseService.renew(lease, request, runtime, 'TOOL');
                    if (lease.cancellationRequested) throw cancellationError(lease.cancellationReason);
                    const toolOutput = await runtime.toolExecutor.executeAndRecord(
                        decision.plan, runtime.toolPolicy, turn, request, runtime, context
                    );
                    executionPhase = 'ANSWER_SYNTHESIS';
                    await executionLeaseService.renew(lease, request, runtime, 'PROVIDER');
                    if (lease.cancellationRequested) throw cancellationError(lease.cancellationReason);
                    await conversationService.appendEvent(turn, 'STATUS', {
                        phase: 'ANSWER_SYNTHESIS'
                    }, request, context);
                    result = await runtime.providerGateway.execute(
                        configuration.providerProfile, 'generate',
                        {
                            messages: providerInput.messages.concat([{
                                role: 'user',
                                content: toolPlanningService.synthesisMessage(toolOutput)
                            }]),
                            instructions: prompts[0].instructions + '\n\n' +
                                toolPlanningService.synthesisInstructions(),
                            maximumOutputTokens: request.maximumOutputTokens
                        },
                        streamingContext,
                        runtime.providerConfiguration
                    );
                }
            }
            executionPhase = 'POST_PROVIDER';
            await executionLeaseService.renew(lease, request, runtime, 'POST_PROVIDER');
            if (lease.cancellationRequested) {
                await conversationService.appendEvent(turn, 'USAGE', {
                    usage: result.usage, reconciliation: result.usageReconciliation
                }, request, context);
                throw cancellationError(lease.cancellationReason);
            }
            if (pendingDelta) {
                await conversationService.appendEvent(turn, 'TEXT_DELTA', {
                    text: pendingDelta
                }, request, context);
            }
            const messageCode = 'message-' + crypto.randomUUID();
            await services.messages.save({
                tenant: identity.tenantCode, authData: request.authData,
                model: {
                    code: messageCode, active: true, messageCode: messageCode,
                    conversationCode: conversation.conversationCode, turnCode: turn.turnCode,
                    tenantCode: identity.tenantCode, principalCode: identity.principalCode,
                    sequence: Number(conversation.lastSequence || 0) + 2, role: 'assistant',
                    content: result.text, createdAt: new Date()
                }
            });
            if (!streamedFinal) {
                await conversationService.appendEvent(turn, 'TEXT_DELTA', { text: result.text }, request, context);
            }
            if (knowledgeContext.evidence.length) {
                await conversationService.appendEvent(turn, 'CITATIONS', {
                    citations: knowledgeContext.citations
                }, request, context);
            }
            if (publishFinalUsage) {
                await conversationService.appendEvent(turn, 'USAGE', {
                    phase: finalUsagePhase,
                    usage: result.usage, reconciliation: result.usageReconciliation
                }, request, context);
            }
            heartbeat.assertOwned();
            const completed = await services.turns.update({
                tenant: identity.tenantCode, authData: request.authData,
                query: {
                    turnCode: turn.turnCode, tenantCode: identity.tenantCode,
                    state: 'PROCESSING', executionOwner: lease.owner
                },
                model: {
                    state: 'COMPLETED', providerRequestId: result.providerRequestId,
                    reservationCode: result.usageReconciliation.reservationId,
                    completedAt: new Date()
                }
            });
            if (affected(completed) !== 1) {
                const current = await executionLeaseService.current(lease, request, runtime);
                if (current && current.state === 'CANCELLATION_REQUESTED') {
                    throw cancellationError(current.cancellationReason);
                }
                const ownershipError = new Error('AI Assistant execution ownership was lost before completion');
                ownershipError.code = 'AI_ASSISTANT_EXECUTION_OWNERSHIP_LOST';
                throw ownershipError;
            }
            await conversationService.appendEvent(turn, 'COMPLETED', {
                finishReason: result.finishReason
            }, request, context);
            turn.state = 'COMPLETED';
            return {
                conversation: conversation, turn: turn, result: result,
                evidence: knowledgeContext.evidence, knowledgeContext: knowledgeContext
            };
        } catch (error) {
            if (error.code === 'AI_ASSISTANT_EXECUTION_OWNERSHIP_LOST') throw error;
            if (this.LOG && typeof this.LOG.error === 'function') {
                this.LOG.error('AI Assistant turn execution failed', {
                    phase: executionPhase,
                    code: error && error.code || 'AI_ASSISTANT_TURN_FAILED',
                    errorName: error && error.name || 'Error',
                    message: String(error && error.message || 'Unknown failure').slice(0, 512)
                });
            }
            const cancelled = error.code === 'EMPLOYEE_CANCELLED' ||
                (request.signal && request.signal.aborted);
            const terminalState = cancelled ? 'CANCELLED' : 'FAILED';
            const failureCode = cancelled ? 'EMPLOYEE_CANCELLED' :
                (error.code || 'AI_ASSISTANT_TURN_FAILED');
            const failurePayload = { code: failureCode };
            if (!cancelled && error.aiProviderNormalized === true && error.providerDiagnostics) {
                failurePayload.providerFailure = {
                    category: error.providerDiagnostics.category,
                    retryable: error.providerDiagnostics.retryable,
                    status: error.providerDiagnostics.status
                };
            }
            const services = conversationService.services(context);
            let terminal = await services.turns.update({
                tenant: identity.tenantCode, authData: request.authData,
                query: {
                    turnCode: turn.turnCode, tenantCode: identity.tenantCode,
                    principalCode: identity.principalCode,
                    state: 'PROCESSING', executionOwner: lease.owner
                },
                model: {
                    state: terminalState, failureCode: cancelled ? undefined :
                    failureCode, completedAt: new Date()
                }
            });
            if (affected(terminal) !== 1 && cancelled) {
                terminal = await services.turns.update({
                    tenant: identity.tenantCode, authData: request.authData,
                    query: {
                        turnCode: turn.turnCode, tenantCode: identity.tenantCode,
                        principalCode: identity.principalCode,
                        state: 'CANCELLATION_REQUESTED', executionOwner: lease.owner
                    },
                    model: { state: 'CANCELLED', completedAt: new Date() }
                });
            }
            if (affected(terminal) === 1) {
                await conversationService.appendEvent(turn, terminalState, failurePayload, request, context);
            }
            turn.state = terminalState;
            throw error;
        } finally {
            heartbeat.stop();
        }
    },

    /** Processes one idempotent employee turn synchronously for service and focused-test callers. */
    process: async function (request, runtime) {
        const prepared = await this.prepare(request, runtime);
        return this.executePrepared(prepared, request, runtime);
    }
};
