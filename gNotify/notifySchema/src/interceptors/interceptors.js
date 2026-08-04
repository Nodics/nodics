/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module notifySchema/src/interceptors/interceptors
 * @description Interceptor definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
const immutable = {
  save: { before: [{ service: "DefaultNotifyDeliveryPersistenceService.authorizeMutation" }] },
  update: { before: [{ service: "DefaultNotifyDeliveryPersistenceService.authorizeMutation" }] },
  remove: { before: [{ service: "DefaultNotifyDeliveryPersistenceService.rejectDelete" }] },
};
module.exports = { notifySchema: {
  notifyDeliveryRequest: immutable,
  notifyMessageContext: immutable,
  notifyDeliveryAttempt: immutable,
  notifyDeliverySuppression: immutable,
  notifyVerificationChallenge: immutable,
} };
