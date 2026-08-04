/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/lifecycle/DefaultOrderLifecycleRequestPolicyService
 * @description Validates and builds private Order-owned cancellation, return, and refund request evidence without executing adjacent-module side effects.
 * @layer service
 * @owner order
 * @override Project modules may replace reason, quantity, and draft policy while preserving exact evidence, private persistence, and owner boundaries.
 */
module.exports = {
  /**
   * Initializes the module artifact within the order-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Completes initialization for the module artifact within the order-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Executes the config operation within the order-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  config: function () {
    return (CONFIG.get("order") || {}).orderLifecycle || {};
  },
  /**
   * Executes the error operation within the order-owned layered contract.
   *
   * @param {*} message Value defined by the surrounding Nodics operation contract.
   * @param {*} code Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  error: function (message, code) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError)
      return new CLASSES.NodicsError(message, null, code || "ERR_ORD_00044");
    let error = new Error(message);
    error.code = code || "ERR_ORD_00044";
    return error;
  },
  /**
   * Authorizes mutation within the order-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  authorizeMutation: function (request) {
    if (!request || request._orderLifecycleMutationAuthorized !== true) {
      return Promise.reject(
        this.error(
          "Order lifecycle evidence can change only through Order-owned orchestration",
        ),
      );
    }
    return Promise.resolve(true);
  },
  /**
   * Rejects hard delete within the order-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  rejectHardDelete: function () {
    return Promise.reject(
      this.error(
        "Order lifecycle evidence is immutable and cannot be hard-deleted",
      ),
    );
  },
  /**
   * Asserts safe within the order-owned layered contract.
   *
   * @param {*} value Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  assertSafe: function (value) {
    if (
      JSON.stringify(value || {}).match(
        /cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload|rawCarrier|carrierPayload|rawLabel|warehousePath/i,
      )
    ) {
      throw this.error(
        "Order lifecycle evidence must not contain credentials, card data, labels, warehouse paths, or raw provider payloads",
      );
    }
  },
  /**
   * Executes the exact positive quantity operation within the order-owned layered contract.
   *
   * @param {*} value Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  exactPositiveQuantity: function (value) {
    if (typeof value !== "string")
      throw this.error(
        "Order lifecycle requestedQuantity must be an exact positive decimal string",
      );
    let quantity = value;
    if (
      !/^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/.test(quantity) ||
      !/[1-9]/.test(quantity)
    ) {
      throw this.error(
        "Order lifecycle requestedQuantity must be an exact positive decimal string",
      );
    }
    return quantity;
  },
  /**
   * Executes the identity part operation within the order-owned layered contract.
   *
   * @param {*} value Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  identityPart: function (value) {
    let part = String(value || "")
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!part)
      throw this.error("Order lifecycle identity component is invalid");
    return part;
  },
  /**
   * Prepares request within the order-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  prepareRequest: function (request) {
    let model = (request && request.model) || {};
    this.assertSafe(model);
    let config = this.config();
    [
      "entCode",
      "requestCode",
      "orderCode",
      "requestType",
      "state",
      "idempotencyKey",
      "requesterType",
      "requesterCode",
      "reasonCode",
    ].forEach((field) => {
      if (!model[field])
        throw this.error("Order lifecycle request requires " + field);
    });
    if (!(config.requestTypes || []).includes(model.requestType))
      throw this.error("Order lifecycle requestType is unsupported");
    if (!(config.requestStates || []).includes(model.state))
      throw this.error("Order lifecycle request state is unsupported");
    if (!Number.isInteger(model.version) || model.version < 1)
      throw this.error(
        "Order lifecycle request version must be a positive integer",
      );
    if (
      model.reasonNote &&
      String(model.reasonNote).length >
        Number(config.maximumReasonLength || 500)
    )
      throw this.error("Order lifecycle reason note exceeds configured bounds");
    return Promise.resolve(true);
  },
  /**
   * Prepares item within the order-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  prepareItem: function (request) {
    let model = (request && request.model) || {};
    this.assertSafe(model);
    [
      "entCode",
      "requestItemCode",
      "requestCode",
      "orderCode",
      "orderEntryCode",
      "unitCode",
      "state",
      "immutableEvidence",
    ].forEach((field) => {
      if (
        model[field] === undefined ||
        model[field] === null ||
        model[field] === ""
      )
        throw this.error("Order lifecycle request item requires " + field);
    });
    model.requestedQuantity = this.exactPositiveQuantity(
      model.requestedQuantity,
    );
    if (!(this.config().itemStates || []).includes(model.state))
      throw this.error("Order lifecycle request item state is unsupported");
    let serialNumbers = model.serialNumbers || [];
    if (
      !Array.isArray(serialNumbers) ||
      serialNumbers.length >
        Number(this.config().maximumSerialNumbersPerItem || 100)
    )
      throw this.error(
        "Order lifecycle serial-number selection exceeds configured bounds",
      );
    if (new Set(serialNumbers.map(String)).size !== serialNumbers.length)
      throw this.error(
        "Order lifecycle serial-number selection contains duplicates",
      );
    return Promise.resolve(true);
  },
  /**
   * Builds draft within the order-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  buildDraft: function (request) {
    let input = (request && (request.orderLifecycle || request.body)) || {};
    let config = this.config();
    this.assertSafe(input);
    if (
      !request ||
      !request.tenant ||
      !request.authData ||
      !input.entCode ||
      !input.orderCode ||
      !input.idempotencyKey ||
      !input.requestType ||
      !input.reasonCode
    ) {
      throw this.error(
        "Order lifecycle draft requires tenant, auth, enterprise, order, idempotency, type, and reason",
      );
    }
    if (!(config.requestTypes || []).includes(input.requestType))
      throw this.error("Order lifecycle requestType is unsupported");
    let allowedReasons = (config.reasonCodes || {})[input.requestType] || [];
    if (!allowedReasons.includes(input.reasonCode))
      throw this.error(
        "Order lifecycle reasonCode is unsupported for requestType",
      );
    let sourceItems = input.items || [];
    if (
      !Array.isArray(sourceItems) ||
      !sourceItems.length ||
      sourceItems.length > Number(config.maximumItemsPerRequest || 100)
    ) {
      throw this.error(
        "Order lifecycle draft requires a bounded non-empty item selection",
      );
    }
    let requesterCode =
      request.authData.principalId ||
      request.authData.userCode ||
      request.authData.code;
    if (!requesterCode)
      throw this.error(
        "Order lifecycle draft requires authenticated requester identity",
      );
    let requestCode =
      input.requestCode ||
      [
        this.identityPart(input.entCode),
        "orderLifecycle",
        this.identityPart(input.idempotencyKey),
      ].join("::");
    let requestModel = {
      entCode: input.entCode,
      requestCode: requestCode,
      orderCode: input.orderCode,
      requestType: input.requestType,
      state: config.initialRequestState || "DRAFT",
      version: 1,
      idempotencyKey: input.idempotencyKey,
      requesterType:
        input.requesterType ||
        (request.authData.tokenType === "service" ? "SERVICE" : "EMPLOYEE"),
      requesterCode: requesterCode,
      customerCode: input.customerCode,
      siteCode: input.siteCode,
      channelCode: input.channelCode,
      currencyCode: input.currencyCode,
      locale: input.locale,
      countryCode: input.countryCode,
      reasonCode: input.reasonCode,
      reasonNote: input.reasonNote,
      requestedOutcome: input.requestedOutcome,
      evidence: input.evidence || {},
    };
    let itemModels = sourceItems.map((item, index) => {
      let itemModel = {
        entCode: input.entCode,
        requestItemCode:
          requestCode +
          "::item::" +
          this.identityPart(item.orderEntryCode) +
          "::" +
          index,
        requestCode: requestCode,
        orderCode: input.orderCode,
        orderEntryCode: item.orderEntryCode,
        requestedQuantity: this.exactPositiveQuantity(item.requestedQuantity),
        unitCode: item.unitCode,
        serialNumbers: item.serialNumbers || [],
        state: config.initialItemState || "REQUESTED",
        immutableEvidence: item.immutableEvidence,
      };
      this.prepareItem({ model: itemModel });
      return itemModel;
    });
    this.prepareRequest({ model: requestModel });
    return { request: requestModel, items: itemModels };
  },
};
