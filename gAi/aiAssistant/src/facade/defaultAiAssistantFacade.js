/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/facade/DefaultAiAssistantFacade
 * @description Delegates secured Assistant HTTP operations to the owning API application service.
 * @layer facade
 * @owner aiAssistant
 */
module.exports = {
    /** Initializes the facade. */
    init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates conversation creation. */
    createConversation: request => SERVICE.DefaultAiAssistantApiService.createConversation(request),
    /** Delegates owned conversation listing. */
    listConversations: request => SERVICE.DefaultAiAssistantApiService.listConversations(request),
    /** Delegates owned conversation lookup. */
    getConversation: request => SERVICE.DefaultAiAssistantApiService.getConversation(request),
    /** Delegates bounded owned conversation history. */
    getConversationHistory: request => SERVICE.DefaultAiAssistantApiService.getConversationHistory(request),
    /** Delegates governed turn submission. */
    submitTurn: request => SERVICE.DefaultAiAssistantApiService.submitTurn(request),
    /** Delegates owned turn lookup. */
    getTurn: request => SERVICE.DefaultAiAssistantApiService.getTurn(request),
    /** Delegates bounded persisted event replay. */
    replayEvents: request => SERVICE.DefaultAiAssistantApiService.replayEvents(request),
    /** Delegates authenticated normalized SSE delivery. */
    streamTurn: request => SERVICE.DefaultAiAssistantSseService.open(request),
    /** Delegates accepted-turn cancellation. */
    cancelTurn: request => SERVICE.DefaultAiAssistantApiService.cancelTurn(request),
    /** Delegates bounded abandoned-turn recovery. */
    recoverTurns: request => SERVICE.DefaultAiAssistantApiService.recoverTurns(request),
    /** Delegates secured execution diagnostics. */
    diagnostics: request => SERVICE.DefaultAiAssistantApiService.diagnostics(request),
    /** Delegates mutation confirmation creation. */
    createConfirmation: request => SERVICE.DefaultAiAssistantConfirmationService.create(request),
    /** Delegates employee-owned mutation confirmation retrieval. */
    getConfirmation: request => SERVICE.DefaultAiAssistantConfirmationService.get(request),
    /** Delegates mutation confirmation approval. */
    approveConfirmation: request => SERVICE.DefaultAiAssistantConfirmationService.approve(request),
    /** Delegates mutation confirmation rejection. */
    rejectConfirmation: request => SERVICE.DefaultAiAssistantConfirmationService.reject(request),
    /** Delegates confirmed execution or Workflow handoff. */
    executeConfirmation: request => SERVICE.DefaultAiAssistantConfirmationService.execute(request)
};
