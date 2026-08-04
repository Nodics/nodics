/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyApi/controller/DefaultNotifyController @description Adapts secured HTTP requests to the notification facade. @layer controller @owner notifyApi */

const respond = function (result, callback) {
    const promise = Promise.resolve(result);
    if (!callback) {
        return promise;
    }
    promise.then(value => callback(null, value)).catch(callback);
};

module.exports = {
    /**
     * Sends the module artifact within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    send: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.send(request), callback);
    },
    /**
     * Executes the test send operation within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    testSend: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.testSend(request), callback);
    },
    /**
     * Executes the manage provider account operation within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    manageProviderAccount: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.manageProviderAccount(request), callback);
    },
    /**
     * Executes the diagnostics operation within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    diagnostics: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.diagnostics(request), callback);
    },
    /**
     * Retries the module artifact within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    retry: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.retry(request), callback);
    },
    /**
     * Executes the preview operation within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    preview: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.preview(request), callback);
    },
    /**
     * Publishes the module artifact within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    publish: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.publish(request), callback);
    },
    /**
     * Executes the retire operation within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    retire: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.retire(request), callback);
    },
    /**
     * Executes the rollback operation within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    rollback: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.rollback(request), callback);
    },
    /**
     * Executes the inbox operation within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    inbox: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.inbox(request), callback);
    },
    /**
     * Executes the acknowledge operation within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    acknowledge: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.acknowledge(request), callback);
    },
    /**
     * Creates verification within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    createVerification: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.createVerification(request), callback);
    },
    /**
     * Validates verification within the notifyApi-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} callback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    validateVerification: function (request, callback) {
        return respond(FACADE.DefaultNotifyFacade.validateVerification(request), callback);
    }
};
