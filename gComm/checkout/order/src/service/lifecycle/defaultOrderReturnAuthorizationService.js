/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/service/lifecycle/DefaultOrderReturnAuthorizationService @description Prepares configured automatic or human return-authorization routing from validated evidence. @layer service @owner order */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, config: function () { return (((CONFIG.get('order') || {}).orderLifecycle || {}).returnAuthorization) || {}; },
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00059'; return error; },
    prepare: function (request) { let input = request.returnAuthorization || {}; if (!input.validation || input.validation.eligible !== true || !input.request || input.request.requestType !== 'RETURN') throw this.error('Return authorization requires eligible immutable request evidence'); let policy = this.config(); let route = policy.autoApprovalEnabled === true && (policy.autoApprovalRequesterTypes || []).includes(input.request.requesterType) ? 'AUTO_APPROVE' : policy.defaultRoute || 'MANUAL_REVIEW'; return { requestCode: input.request.requestCode, requestVersion: input.request.version, route: route, validation: input.validation }; },
    validateAuthorization: function (request, response, process) { try { response.returnAuthorization = this.prepare(request); process.nextSuccess(request, response); } catch (error) { process.error(request, response, error); } },
    handleSuccessEnd: function (request, response, process) { process.resolve(response.returnAuthorization); }, handleErrorEnd: function (request, response, process) { process.reject(response.error || this.error('Return authorization Pipeline failed')); },
};
