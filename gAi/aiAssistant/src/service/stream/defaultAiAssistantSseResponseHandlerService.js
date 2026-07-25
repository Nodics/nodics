/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/service/stream/DefaultAiAssistantSseResponseHandlerService
 * @description Prevents JSON double-writes after an Assistant SSE controller owns the response.
 * @layer service
 * @owner aiAssistant
 */
module.exports = {
    /** Initializes the response handler. */
    init: function () { return Promise.resolve(true); },
    /** Completes response-handler initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Leaves an already committed SSE response untouched. */
    handleSuccess: function (_request, _response, success) {
        if (!success || !success.metadata || success.metadata.responseCommitted !== true) {
            throw new Error('AI Assistant SSE response was not committed by its controller');
        }
    },
    /** Uses the standard JSON error contract only before SSE headers are committed. */
    handleError: function (request, response, error) {
        if (!response.headersSent) {
            return SERVICE.DefaultJsonResponseHandlerService.handleError(request, response, error);
        }
        if (!response.writableEnded) {
            response.write('event: failed\ndata: {"code":"AI_ASSISTANT_STREAM_FAILED"}\n\n');
            response.end();
        }
    }
};
