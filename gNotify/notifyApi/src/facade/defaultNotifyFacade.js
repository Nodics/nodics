/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyApi/facade/DefaultNotifyFacade @description Thin secured transport facade for provider-neutral notification operations. @layer facade @owner notifyApi */
module.exports = { send: request => SERVICE.DefaultNotifyDeliveryService.send(request), testSend: request => SERVICE.DefaultNotifyOperationsService.testSend(request, request.body), manageProviderAccount: request => SERVICE.DefaultNotifyOperationsService.manageProviderAccount(request, request.body), diagnostics: request => SERVICE.DefaultNotifyOperationsService.diagnostics(request), retry: request => SERVICE.DefaultPipelineService.start('notifyRetryDeliveryPipeline', Object.assign({}, request, { notifyRetry: request.body }), {}), preview: request => SERVICE.DefaultNotifyTemplateManagementService.preview(request, request.body), publish: request => SERVICE.DefaultNotifyTemplateManagementService.publish(request, request.body), retire: request => SERVICE.DefaultNotifyTemplateManagementService.retire(request, request.body), rollback: request => SERVICE.DefaultNotifyTemplateManagementService.rollback(request, request.body), inbox: request => SERVICE.DefaultNotifyInAppService.inbox(request), acknowledge: request => SERVICE.DefaultNotifyInAppService.acknowledge(request, request.body), createVerification: request => SERVICE.DefaultNotifyVerificationService.create(request), validateVerification: request => SERVICE.DefaultNotifyVerificationService.validate(request) };
