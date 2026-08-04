/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/data/lifecycle/defaultOrderLifecyclePolicyHeader @description Seeds draft governed lifecycle policy and reason records. @layer data @owner order */
module.exports = { order: { defaultOrderLifecyclePolicy: { options: { enabled: true, schemaName: 'orderLifecyclePolicyRule', operation: 'saveAll', dataFilePrefix: 'defaultOrderLifecyclePolicyData' }, query: { policyCode: '$policyCode', entCode: '$entCode' } }, defaultOrderLifecycleReason: { options: { enabled: true, schemaName: 'orderLifecycleReason', operation: 'saveAll', dataFilePrefix: 'defaultOrderLifecycleReasonData' }, query: { reasonCode: '$reasonCode', entCode: '$entCode' } } } };
