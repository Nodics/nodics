/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module notifyCore/src/pipelines/pipelines @description Replaceable technical notification delivery and retry Pipelines; Workflow owns long-running approvals and human review. @layer pipeline @owner notifyCore */
module.exports = { notifyCore: {
  notifyMessageDeliveryPipeline: { startNode: 'validateRequest', hardStop: true, nodes: {
    validateRequest: { handler: 'DefaultNotifyDeliveryPipelineService.validateRequest', success: 'resolveScenario', idempotent: 'handleIdempotentEnd' },
    resolveScenario: { handler: 'DefaultNotifyDeliveryPipelineService.resolveScenario', success: 'resolveChannel' },
    resolveChannel: { handler: 'DefaultNotifyDeliveryPipelineService.resolveChannel', success: 'resolveRecipientAndConsent' },
    resolveRecipientAndConsent: { handler: 'DefaultNotifyDeliveryPipelineService.resolveRecipientAndConsent', success: 'resolveTemplate', suppressed: 'persistSuppression' },
    resolveTemplate: { handler: 'DefaultNotifyDeliveryPipelineService.resolveTemplate', success: 'resolveContext' },
    resolveContext: { handler: 'DefaultNotifyDeliveryPipelineService.resolveContext', success: 'renderContent' },
    renderContent: { handler: 'DefaultNotifyDeliveryPipelineService.renderContent', success: 'selectProvider' },
    selectProvider: { handler: 'DefaultNotifyDeliveryPipelineService.selectProvider', success: 'persistRequest' },
    persistRequest: { handler: 'DefaultNotifyDeliveryPipelineService.persistRequest', success: 'sendMessage' },
    sendMessage: { handler: 'DefaultNotifyDeliveryPipelineService.sendMessage', success: 'normalizeResult', error: 'normalizeFailure' },
    normalizeResult: { handler: 'DefaultNotifyDeliveryPipelineService.normalizeResult', success: 'persistAttempt' },
    normalizeFailure: { handler: 'DefaultNotifyDeliveryPipelineService.normalizeFailure', success: 'persistAttempt' },
    persistAttempt: { handler: 'DefaultNotifyDeliveryPipelineService.persistAttempt', success: 'publishEvent' },
    persistSuppression: { handler: 'DefaultNotifyDeliveryPipelineService.persistSuppression', success: 'publishEvent' },
    publishEvent: { handler: 'DefaultNotifyDeliveryPipelineService.publishEvent', success: 'handleSuccessEnd' },
    handleSuccessEnd: { handler: 'DefaultNotifyDeliveryPipelineService.handleSuccessEnd' },
    handleIdempotentEnd: { handler: 'DefaultNotifyDeliveryPipelineService.handleIdempotentEnd' },
    handleErrorEnd: { handler: 'DefaultNotifyDeliveryPipelineService.handleErrorEnd' },
  } },
  notifyRetryDeliveryPipeline: { startNode: 'loadRetry', hardStop: true, nodes: {
    loadRetry: { handler: 'DefaultNotifyRetryPipelineService.loadRetry', success: 'assertRetry' },
    assertRetry: { handler: 'DefaultNotifyRetryPipelineService.assertRetry', success: 'executeRetry' },
    executeRetry: { handler: 'DefaultNotifyRetryPipelineService.executeRetry', success: 'handleSuccessEnd' },
    handleSuccessEnd: { handler: 'DefaultNotifyRetryPipelineService.handleSuccessEnd' }, handleErrorEnd: { handler: 'DefaultNotifyRetryPipelineService.handleErrorEnd' },
  } },
} };
