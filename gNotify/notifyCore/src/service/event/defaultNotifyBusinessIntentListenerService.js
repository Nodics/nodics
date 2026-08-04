/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/event/DefaultNotifyBusinessIntentListenerService @description Converts owner-published commerce and Workflow intents into governed delivery requests without assuming owner state. @layer service @owner notifyCore */
module.exports = {
  /**
   * Initializes the module artifact within the notifyCore-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
  data: event => event && (event.data || event.event && event.event.data) || {},
  /**
   * Sends the module artifact within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} data Value defined by the surrounding Nodics operation contract.
   * @param {*} defaults Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  send: function (request, data, defaults) { let intent = data.notificationIntent; if (!intent) return Promise.resolve({ ignored: true, reason: 'NO_NOTIFICATION_INTENT' }); return SERVICE.DefaultNotifyDeliveryService.send(request, { idempotencyKey: data.eventCode + ':' + defaults.scenarioCode + ':' + defaults.channelCode, scenarioCode: defaults.scenarioCode, channelCode: defaults.channelCode, messageTypeCode: defaults.messageTypeCode, templateCode: intent.templateCode, recipientType: defaults.recipientType, recipientReference: defaults.recipientReference, maskedRecipient: defaults.maskedRecipient || 'owner-resolved', ownerModule: defaults.ownerModule, ownerReferenceType: defaults.ownerReferenceType, ownerReferenceCode: defaults.ownerReferenceCode, correlationId: data.correlationId || data.eventCode, valueBuilderService: defaults.valueBuilderService, values: intent.templateVariables || {} }); },
  /**
   * Handles order lifecycle within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  handleOrderLifecycle: function (request) { let data = this.data(request.event || request), type = String(data.requestType || '').toUpperCase(), scenario = type === 'REFUND' ? 'refundApproval' : type === 'CANCELLATION' || type === 'RETURN' ? 'supportEscalation' : 'orderConfirmation'; return this.send(request, data, { scenarioCode: scenario, channelCode: scenario === 'refundApproval' ? 'inApp' : 'email', messageTypeCode: scenario === 'refundApproval' ? 'workflow' : 'transactional', recipientType: 'CUSTOMER', recipientReference: 'customer:' + data.customerCode, ownerModule: 'order', ownerReferenceType: type || 'ORDER', ownerReferenceCode: data.requestCode || data.orderCode, valueBuilderService: 'DefaultOrderLifecycleNotifyContextBuilderService' }); },
  /**
   * Handles workflow task within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  handleWorkflowTask: function (request) { let data = this.data(request.event || request); data.notificationIntent = data.notificationIntent || { templateCode: 'workflow-task-assigned' }; return this.send(request, data, { scenarioCode: 'workflowTaskAssigned', channelCode: 'inApp', messageTypeCode: 'workflow', recipientType: 'PRINCIPAL', recipientReference: 'principal:' + data.assigneePrincipalId, ownerModule: 'workflow', ownerReferenceType: 'WORKFLOW_TASK', ownerReferenceCode: data.taskCode, valueBuilderService: 'DefaultWorkflowNotifyContextBuilderService' }); },
  /**
   * Handles workflow failure within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  handleWorkflowFailure: function (request) { let data = this.data(request.event || request); data.notificationIntent = data.notificationIntent || { templateCode: 'workflow-failure' }; return this.send(request, data, { scenarioCode: 'deliveryFailure', channelCode: 'inApp', messageTypeCode: 'operational', recipientType: 'OPERATIONS', recipientReference: 'operations:on-call', ownerModule: 'notifyCore', ownerReferenceType: 'WORKFLOW_FAILURE', ownerReferenceCode: data.taskCode, valueBuilderService: 'DefaultWorkflowNotifyContextBuilderService' }); },
};
