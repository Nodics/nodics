/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/workflow/flowApi/src/facade/defaultWorkflowFacade
 * @description Coordinates facade-level delegation for workflow default workflow facade operations.
 * @layer facade
 * @owner workflow
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Initializes carrier behavior for the module runtime.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    initCarrier: function (request) {
        return SERVICE.DefaultWorkflowService.initCarrier(request);
    },
    /**
     * Executes release carrier behavior.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    releaseCarrier: function (request) {
        return SERVICE.DefaultWorkflowService.releaseCarrier(request);
    },
    /**
     * Updates carrier information.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    updateCarrier: function (request) {
        return SERVICE.DefaultWorkflowService.updateCarrier(request);
    },
    /**
     * Executes perform action behavior.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    performAction: function (request) {
        return SERVICE.DefaultWorkflowService.performAction(request);
    },
    /**
     * Executes the delegate action operation within the flowApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    delegateAction: function (request) { return SERVICE.DefaultWorkflowService.delegateAction(request); },
    /**
     * Executes the takeover action operation within the flowApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    takeoverAction: function (request) { return SERVICE.DefaultWorkflowService.takeoverAction(request); },

    // blockCarrier: function (request) {
    //     return SERVICE.DefaultWorkflowService.blockCarrier(request);
    // },



    // pauseCarrier: function (request) {
    //     return SERVICE.DefaultWorkflowService.pauseCarrier(request);
    // },

    // resumeCarrier: function (request) {
    //     return SERVICE.DefaultWorkflowService.resumeCarrier(request);
    // },

    // nextAction: function (request) {
    //     return SERVICE.DefaultWorkflowService.nextAction(request);
    // },

    // getWorkflowChain: function (request) {
    //     return SERVICE.DefaultWorkflowService.getWorkflowChain(request);
    // },


};
