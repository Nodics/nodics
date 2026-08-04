/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/interceptors/interceptors
 * @description Schema interceptor registrations for order save lifecycle hooks.
 * @layer interceptor
 * @owner order
 * @override Project modules may add, reorder, disable, or replace order interceptor registrations through later module contributions.
 */
module.exports = {
  orderPreSaveEntCode: {
    type: "schema",
    item: "order",
    trigger: "preSave",
    active: "true",
    index: 0,
    handler: "DefaultOrderCodeGeneratorInterceptorService.generateEntCode",
  },
  orderPreSaveOrderCode: {
    type: "schema",
    item: "order",
    trigger: "preSave",
    active: "true",
    index: 1,
    handler: "DefaultOrderCodeGeneratorInterceptorService.generateOrderCode",
  },
  orderEntryPreSavePolicy: {
    type: "schema",
    item: "orderEntry",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: "DefaultOrderEntryPolicyService.prepareEntry",
  },
  orderEntryPreUpdatePolicy: {
    type: "schema",
    item: "orderEntry",
    trigger: "preUpdate",
    active: "true",
    index: -100,
    handler: "DefaultOrderEntryPolicyService.prepareEntryUpdate",
  },
  orderEntryPreRemovePolicy: {
    type: "schema",
    item: "orderEntry",
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultOrderEntryPolicyService.rejectHardDelete",
  },
  orderDeliveryGroupPreSavePolicy: {
    type: "schema",
    item: "orderDeliveryGroup",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: "DefaultOrderCheckoutAllocationPolicyService.prepareDeliveryGroup",
  },
  orderDeliveryAllocationPreSavePolicy: {
    type: "schema",
    item: "orderDeliveryAllocation",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler:
      "DefaultOrderCheckoutAllocationPolicyService.prepareDeliveryAllocation",
  },
  orderPaymentGroupPreSavePolicy: {
    type: "schema",
    item: "orderPaymentGroup",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: "DefaultOrderCheckoutAllocationPolicyService.preparePaymentGroup",
  },
  orderPaymentAllocationPreSavePolicy: {
    type: "schema",
    item: "orderPaymentAllocation",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler:
      "DefaultOrderCheckoutAllocationPolicyService.preparePaymentAllocation",
  },
  orderDeliveryGroupPreRemovePolicy: {
    type: "schema",
    item: "orderDeliveryGroup",
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultOrderCheckoutAllocationPolicyService.rejectHardDelete",
  },
  orderDeliveryAllocationPreRemovePolicy: {
    type: "schema",
    item: "orderDeliveryAllocation",
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultOrderCheckoutAllocationPolicyService.rejectHardDelete",
  },
  orderPaymentGroupPreRemovePolicy: {
    type: "schema",
    item: "orderPaymentGroup",
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultOrderCheckoutAllocationPolicyService.rejectHardDelete",
  },
  orderPaymentAllocationPreRemovePolicy: {
    type: "schema",
    item: "orderPaymentAllocation",
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultOrderCheckoutAllocationPolicyService.rejectHardDelete",
  },
  orderLifecycleRequestPreSavePolicy: {
    type: "schema",
    item: "orderLifecycleRequest",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: "DefaultOrderLifecycleRequestPolicyService.authorizeMutation",
  },
  orderLifecycleRequestPreSaveValidation: {
    type: "schema",
    item: "orderLifecycleRequest",
    trigger: "preSave",
    active: "true",
    index: -90,
    handler: "DefaultOrderLifecycleRequestPolicyService.prepareRequest",
  },
  orderLifecycleRequestPreUpdatePolicy: {
    type: "schema",
    item: "orderLifecycleRequest",
    trigger: "preUpdate",
    active: "true",
    index: -100,
    handler: "DefaultOrderLifecycleRequestPolicyService.authorizeMutation",
  },
  orderLifecycleRequestPreUpdateValidation: {
    type: "schema",
    item: "orderLifecycleRequest",
    trigger: "preUpdate",
    active: "true",
    index: -90,
    handler: "DefaultOrderLifecycleRequestPolicyService.prepareRequest",
  },
  orderLifecycleRequestPreRemovePolicy: {
    type: "schema",
    item: "orderLifecycleRequest",
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultOrderLifecycleRequestPolicyService.rejectHardDelete",
  },
  orderLifecycleRequestItemPreSavePolicy: {
    type: "schema",
    item: "orderLifecycleRequestItem",
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: "DefaultOrderLifecycleRequestPolicyService.authorizeMutation",
  },
  orderLifecycleRequestItemPreSaveValidation: {
    type: "schema",
    item: "orderLifecycleRequestItem",
    trigger: "preSave",
    active: "true",
    index: -90,
    handler: "DefaultOrderLifecycleRequestPolicyService.prepareItem",
  },
  orderLifecycleRequestItemPreUpdatePolicy: {
    type: "schema",
    item: "orderLifecycleRequestItem",
    trigger: "preUpdate",
    active: "true",
    index: -100,
    handler: "DefaultOrderLifecycleRequestPolicyService.authorizeMutation",
  },
  orderLifecycleRequestItemPreUpdateValidation: {
    type: "schema",
    item: "orderLifecycleRequestItem",
    trigger: "preUpdate",
    active: "true",
    index: -90,
    handler: "DefaultOrderLifecycleRequestPolicyService.prepareItem",
  },
  orderLifecycleRequestItemPreRemovePolicy: {
    type: "schema",
    item: "orderLifecycleRequestItem",
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultOrderLifecycleRequestPolicyService.rejectHardDelete",
  },
  orderLifecyclePolicyRulePreSavePolicy: { type: "schema", item: "orderLifecyclePolicyRule", trigger: "preSave", active: "true", index: -100, handler: "DefaultOrderLifecyclePolicyManagementService.authorizeSeed" },
  orderLifecyclePolicyRulePreUpdatePolicy: { type: "schema", item: "orderLifecyclePolicyRule", trigger: "preUpdate", active: "true", index: -100, handler: "DefaultOrderLifecyclePolicyManagementService.authorizeMutation" },
  orderLifecyclePolicyRulePreRemovePolicy: { type: "schema", item: "orderLifecyclePolicyRule", trigger: "preRemove", active: "true", index: -100, handler: "DefaultOrderLifecyclePolicyManagementService.rejectHardDelete" },
  orderLifecycleReasonPreSavePolicy: { type: "schema", item: "orderLifecycleReason", trigger: "preSave", active: "true", index: -100, handler: "DefaultOrderLifecyclePolicyManagementService.authorizeSeed" },
  orderLifecycleReasonPreUpdatePolicy: { type: "schema", item: "orderLifecycleReason", trigger: "preUpdate", active: "true", index: -100, handler: "DefaultOrderLifecyclePolicyManagementService.authorizeMutation" },
  orderLifecycleReasonPreRemovePolicy: { type: "schema", item: "orderLifecycleReason", trigger: "preRemove", active: "true", index: -100, handler: "DefaultOrderLifecyclePolicyManagementService.rejectHardDelete" },
};
