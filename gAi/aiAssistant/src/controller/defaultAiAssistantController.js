/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/controller/DefaultAiAssistantController
 * @description Normalizes secured HTTP input and delegates Assistant operations through the facade.
 * @layer controller
 * @owner aiAssistant
 */
module.exports = {
    /** Initializes the controller. */
    init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Normalizes HTTP input and invokes one facade operation with optional callback support. */
    invoke: function (operation, request, callback) {
        const http = request.httpRequest || {};
        request.body = http.body || request.body || {};
        request.query = http.query || request.query || {};
        request.conversationCode = http.params && http.params.conversationCode || request.conversationCode;
        request.turnCode = http.params && http.params.turnCode || request.turnCode;
        request.confirmationCode = http.params && http.params.confirmationCode || request.confirmationCode;
        request.idempotencyKey = request.body.idempotencyKey ||
            (typeof http.get === 'function' && http.get('Idempotency-Key')) || request.idempotencyKey;
        const promise = FACADE.DefaultAiAssistantFacade[operation](request);
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Handles conversation creation. */
    createConversation: function (request, callback) { return this.invoke('createConversation', request, callback); },
    /** Handles owned conversation listing. */
    listConversations: function (request, callback) { return this.invoke('listConversations', request, callback); },
    /** Handles owned conversation lookup. */
    getConversation: function (request, callback) { return this.invoke('getConversation', request, callback); },
    /** Handles governed turn submission. */
    submitTurn: function (request, callback) { return this.invoke('submitTurn', request, callback); },
    /** Handles owned turn lookup. */
    getTurn: function (request, callback) { return this.invoke('getTurn', request, callback); },
    /** Handles bounded persisted event replay. */
    replayEvents: function (request, callback) { return this.invoke('replayEvents', request, callback); },
    /** Handles authenticated normalized SSE delivery. */
    streamTurn: function (request, callback) { return this.invoke('streamTurn', request, callback); },
    /** Handles accepted-turn cancellation. */
    cancelTurn: function (request, callback) { return this.invoke('cancelTurn', request, callback); },
    /** Handles bounded service-token abandoned-turn recovery. */
    recoverTurns: function (request, callback) { return this.invoke('recoverTurns', request, callback); },
    /** Handles secured low-disclosure execution diagnostics. */
    diagnostics: function (request, callback) { return this.invoke('diagnostics', request, callback); }
    ,
    /** Creates a mutation confirmation. */
    createConfirmation: function (request, callback) { return this.invoke('createConfirmation', request, callback); },
    /** Approves a mutation confirmation. */
    approveConfirmation: function (request, callback) { return this.invoke('approveConfirmation', request, callback); },
    /** Executes or hands off an approved mutation. */
    executeConfirmation: function (request, callback) { return this.invoke('executeConfirmation', request, callback); }
};
