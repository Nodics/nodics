/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nems/facade/DefaultEventHandlerFacade
 * @description Facade boundary that delegates event processing and reset commands to the NEMS service.
 * @layer facade
 * @owner nems
 * @override Project modules may override this facade to add event-processing policy or orchestration.
 */
module.exports = {

    /**
     * Delegates pending event processing to `DefaultEventHandlerService`.
     *
     * @param {Object} request Event processing request.
     * @returns {Promise<Object>} Event processing result.
     */
    processEvents: function (request) {
        return SERVICE.DefaultEventHandlerService.processEvents(request);
    },

    /**
     * Delegates stale event reset to `DefaultEventHandlerService`.
     *
     * @param {Object} request Event reset request.
     * @returns {Promise<Object>} Event reset result.
     */
    resetEvents: function (request) {
        return SERVICE.DefaultEventHandlerService.resetEvents(request);
    }
};
