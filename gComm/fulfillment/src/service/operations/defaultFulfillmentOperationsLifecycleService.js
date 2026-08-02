/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/service/operations/DefaultFulfillmentOperationsLifecycleService
 * @description Operates safe Fulfillment lifecycle actions for Axis without storing carrier credentials, raw labels, or raw provider payloads.
 * @layer service
 * @owner fulfillment
 * @override Project modules may replace carrier validation, live sandbox probes, warehouse execution, label purchasing, tracking normalization, return approval, or approval-workflow integration.
 */
module.exports = {
  /** Initializes Fulfillment lifecycle operations. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes Fulfillment lifecycle operations startup. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Creates a stable lifecycle error. */
  error: function (message, code) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError)
      return new CLASSES.NodicsError(message, null, code || "ERR_FUL_00009");
    let error = new Error(message);
    error.code = code || "ERR_FUL_00009";
    return error;
  },
  /** Normalizes generated-service responses and preloaded arrays. */
  items: function (value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.result)) return value.result;
    if (value.result && Array.isArray(value.result.items))
      return value.result.items;
    if (Array.isArray(value.items)) return value.items;
    return [value];
  },
  /** Returns a safe model from the request. */
  model: function (request) {
    let body = (request || {}).body || {};
    return (
      (request || {}).model ||
      body.model ||
      body.record ||
      body.provider ||
      body.shipment ||
      body.returnRequest ||
      {}
    );
  },
  /** Builds request input for specialized Fulfillment services. */
  serviceRequest: function (request, model, alias) {
    let body = (request || {}).body || {};
    let input = Object.assign({}, body, request || {}, model || {}, {
      body: body,
      model: model || this.model(request),
      enterpriseCode:
        (model && model.enterpriseCode) ||
        (request || {}).enterpriseCode ||
        (request || {}).entCode,
      entCode:
        (request || {}).entCode ||
        (model && model.enterpriseCode) ||
        (request || {}).enterpriseCode,
    });
    if (alias) input[alias] = model || this.model(request);
    return input;
  },
  /** Resolves one carrier provider from request model, governed records, or module configuration. */
  provider: async function (request) {
    let body = (request || {}).body || {};
    let model = this.model(request);
    if (model && model.carrierCode) {
      return SERVICE.DefaultFulfillmentPolicyService.prepareCarrierProvider({
        model: Object.assign({}, model),
      });
    }
    let carrierCode =
      body.carrierCode ||
      (request || {}).carrierCode ||
      (body.identity && body.identity.carrierCode);
    if (!carrierCode)
      throw this.error(
        "Fulfillment carrier provider lifecycle requires carrierCode",
      );
    if (
      SERVICE.DefaultFulfillmentCarrierProviderService &&
      typeof SERVICE.DefaultFulfillmentCarrierProviderService.get === "function"
    ) {
      let response = await SERVICE.DefaultFulfillmentCarrierProviderService.get(
        {
          tenant: request && request.tenant,
          authData: request && request.authData,
          query: { carrierCode: carrierCode },
          searchOptions: { limit: 2 },
        },
      );
      let providers = this.items(response);
      if (providers.length > 1)
        throw this.error(
          "Fulfillment carrier provider lifecycle resolved duplicate providers",
        );
      if (providers[0])
        return SERVICE.DefaultFulfillmentPolicyService.prepareCarrierProvider({
          model: Object.assign({}, providers[0]),
        });
    }
    if (
      SERVICE.DefaultFulfillmentCarrierRegistryService &&
      typeof SERVICE.DefaultFulfillmentCarrierRegistryService.provider ===
        "function"
    ) {
      return SERVICE.DefaultFulfillmentCarrierRegistryService.provider(
        carrierCode,
      );
    }
    throw this.error("Fulfillment carrier provider registry is unavailable");
  },
  /** Persists a provider status update when governed provider services are active. */
  saveProviderStatus: async function (request, provider, status) {
    let model = Object.assign({}, provider, {
      status: status,
      lifecycleUpdatedAt: new Date(),
    });
    SERVICE.DefaultFulfillmentPolicyService.prepareCarrierProvider({
      model: model,
    });
    if (
      SERVICE.DefaultFulfillmentCarrierProviderService &&
      typeof SERVICE.DefaultFulfillmentCarrierProviderService.save ===
        "function"
    ) {
      let response =
        await SERVICE.DefaultFulfillmentCarrierProviderService.save({
          tenant: request && request.tenant,
          authData: request && request.authData,
          model: model,
        });
      return this.items(response)[0] || response.result || model;
    }
    return model;
  },
  /** Returns a bounded safe Fulfillment summary for Axis. */
  summary: function (record, action, extra) {
    return Object.assign(
      {
        action: action,
        enterpriseCode: record && record.enterpriseCode,
        carrierCode: record && record.carrierCode,
        modeCode: record && record.modeCode,
        consignmentCode: record && record.consignmentCode,
        shipmentCode: record && record.shipmentCode,
        taskCode: record && record.taskCode,
        eventCode: record && record.eventCode,
        returnCode: record && record.returnCode,
        orderCode: record && record.orderCode,
        status: record && record.status,
        credentialManagedExternally: true,
        secretsStoredInFulfillment: false,
      },
      extra || {},
    );
  },
  /** Maps externally declared lifecycle action ids to internal service methods. */
  actionHandlers: function () {
    return {
      "review-fulfillment-exceptions": "reviewExceptions",
      "release-consignment": "releaseConsignment",
      "cancel-consignment": "cancelConsignment",
      "create-shipping-mode": "validateShippingMode",
      "retire-shipping-mode": "retireShippingMode",
      "create-carrier-provider": "validateCarrierProvider",
      "validate-carrier-provider": "validateCarrierProvider",
      "test-carrier-provider": "testCarrierProvider",
      "suspend-carrier-provider": "suspendCarrierProvider",
      "request-label": "requestLabel",
      "dispatch-shipment": "dispatchShipment",
      "complete-warehouse-task": "completeWarehouseTask",
      "reconcile-tracking": "reconcileTracking",
      "approve-return": "approveReturn",
      "close-return": "closeReturn",
    };
  },
  /** Executes one externally declared lifecycle action through an explicit allowlist. */
  execute: async function (request) {
    let body = (request || {}).body || request || {};
    let actionId = body.actionId || body.action || body.lifecycleActionId;
    if (!actionId)
      throw this.error("Fulfillment lifecycle actionId is required");
    let handlerName = this.actionHandlers()[actionId];
    if (!handlerName || typeof this[handlerName] !== "function") {
      throw this.error("Fulfillment lifecycle action is unsupported");
    }
    let result = await this[handlerName](
      Object.assign({}, request, body, { body: body }),
    );
    return Object.assign(
      {
        actionId: actionId,
        handlerAction:
          "DefaultFulfillmentOperationsLifecycleService." + handlerName,
      },
      result || {},
    );
  },
  /** Reviews current exception policy without mutating records. */
  reviewExceptions: async function (request) {
    let policy = (CONFIG.get("fulfillment") || {}).fulfillmentPolicy || {};
    return this.summary(this.model(request), "REVIEW_EXCEPTIONS", {
      valid: true,
      exceptionStatuses: ["FAILED"],
      consignmentStatuses: policy.consignmentStatuses || [],
      shipmentStatuses: policy.shipmentStatuses || [],
      trackingEventStatuses: policy.trackingEventStatuses || [],
      returnStatuses: policy.returnStatuses || [],
    });
  },
  /** Validates shipping mode metadata through Fulfillment policy. */
  validateShippingMode: async function (request) {
    let mode = SERVICE.DefaultFulfillmentPolicyService.prepareMode({
      model: Object.assign({}, this.model(request)),
    });
    return this.summary(mode, "VALIDATE_SHIPPING_MODE", {
      valid: true,
      displayName: mode.displayName,
    });
  },
  /** Retires a shipping mode after policy validation. */
  retireShippingMode: async function (request) {
    let mode = SERVICE.DefaultFulfillmentPolicyService.prepareMode({
      model: Object.assign({}, this.model(request), { status: "INACTIVE" }),
    });
    if (
      SERVICE.DefaultFulfillmentModeService &&
      typeof SERVICE.DefaultFulfillmentModeService.save === "function"
    ) {
      let response = await SERVICE.DefaultFulfillmentModeService.save({
        tenant: request && request.tenant,
        authData: request && request.authData,
        model: mode,
      });
      mode = this.items(response)[0] || response.result || mode;
    }
    return this.summary(mode, "RETIRE_SHIPPING_MODE", {
      valid: true,
      displayName: mode.displayName,
    });
  },
  /** Validates carrier provider metadata, adapter availability, and unsafe-field governance. */
  validateCarrierProvider: async function (request) {
    let provider = await this.provider(request || {});
    SERVICE.DefaultFulfillmentPolicyService.prepareCarrierProvider({
      model: Object.assign({}, provider),
    });
    let adapterAvailable = !!(
      provider.adapterService && SERVICE[provider.adapterService]
    );
    let policy =
      SERVICE.DefaultFulfillmentCarrierPolicyService &&
      typeof SERVICE.DefaultFulfillmentCarrierPolicyService.resolve ===
        "function"
        ? SERVICE.DefaultFulfillmentCarrierPolicyService.resolve({
            provider: provider,
          })
        : {
            adapterService: provider.adapterService,
            carrierCode: provider.carrierCode,
          };
    if (!adapterAvailable)
      throw this.error(
        "Fulfillment carrier adapter is not active for " + provider.carrierCode,
      );
    return this.summary(provider, "VALIDATE_CARRIER_PROVIDER", {
      valid: true,
      providerType: provider.providerType,
      modeCodes: provider.modeCodes || provider.supportedDeliveryModes || [],
      supportsLabels: provider.supportsLabels,
      supportsTracking: provider.supportsTracking,
      adapterService: policy.adapterService,
      configurationRef: provider.configurationRef,
      credentialsResolved: false,
    });
  },
  /** Performs a safe carrier provider test without persisting raw labels or provider payloads. */
  testCarrierProvider: async function (request) {
    let provider = await this.provider(request || {});
    let validation = await this.validateCarrierProvider(
      Object.assign({}, request, { model: provider }),
    );
    return this.summary(
      provider,
      "TEST_CARRIER_PROVIDER",
      Object.assign({}, validation, {
        valid: true,
        testStatus: "CONFIGURATION_READY",
        liveProviderCall: false,
      }),
    );
  },
  /** Suspends a governed carrier provider without deleting fulfillment evidence. */
  suspendCarrierProvider: async function (request) {
    let provider = await this.provider(request || {});
    let model = await this.saveProviderStatus(
      request || {},
      provider,
      "SUSPENDED",
    );
    return this.summary(model, "SUSPEND_CARRIER_PROVIDER", { valid: true });
  },
  /** Releases a consignment or validates an existing consignment row selection. */
  releaseConsignment: async function (request) {
    let model = this.model(request);
    if (model.consignmentCode)
      return this.summary(model, "RELEASE_CONSIGNMENT", {
        valid: true,
        alreadyReleased: true,
      });
    let result = await SERVICE.DefaultFulfillmentReleaseService.release(
      this.serviceRequest(request, model),
    );
    return Object.assign(
      this.summary(model, "RELEASE_CONSIGNMENT", { valid: true }),
      result || {},
    );
  },
  /** Cancels a selected consignment through Fulfillment release policy. */
  cancelConsignment: async function (request) {
    let model = this.model(request);
    let input = this.serviceRequest(request, model);
    input.fulfillmentRelease = {
      consignments:
        model && model.consignmentCode
          ? [model]
          : this.items(model.consignments),
    };
    let result =
      await SERVICE.DefaultFulfillmentReleaseService.cancelRelease(input);
    return Object.assign(
      this.summary(model, "CANCEL_CONSIGNMENT", { valid: true }),
      result || {},
    );
  },
  /** Requests a shipment label through the configured carrier adapter. */
  requestLabel: async function (request) {
    let model = this.model(request);
    let result = await SERVICE.DefaultShipmentLabelService.requestLabel(
      this.serviceRequest(request, model, "shipment"),
    );
    return this.summary(result, "REQUEST_LABEL", {
      valid: true,
      shipment: result,
    });
  },
  /** Dispatches a shipment after Fulfillment and Inventory checks. */
  dispatchShipment: async function (request) {
    let model = this.model(request);
    let result =
      await SERVICE.DefaultFulfillmentShipmentLifecycleService.dispatch(
        this.serviceRequest(request, model, "shipment"),
      );
    return Object.assign(
      this.summary(model, "DISPATCH_SHIPMENT", { valid: true }),
      result || {},
    );
  },
  /** Completes a selected warehouse task. */
  completeWarehouseTask: async function (request) {
    let model = this.model(request);
    let result = await SERVICE.DefaultWarehouseTaskService.completeTask(
      this.serviceRequest(request, model, "task"),
    );
    return this.summary(result, "COMPLETE_WAREHOUSE_TASK", {
      valid: true,
      task: result,
    });
  },
  /** Reconciles one selected normalized tracking event. */
  reconcileTracking: async function (request) {
    let model = this.model(request);
    if (!model.normalizedEventType)
      return this.summary(model, "RECONCILE_TRACKING", {
        valid: true,
        noSelectedEvent: true,
      });
    let result = await SERVICE.DefaultTrackingEventService.ingestEvent(
      this.serviceRequest(request, model, "event"),
    );
    return Object.assign(
      this.summary(model, "RECONCILE_TRACKING", { valid: true }),
      result || {},
    );
  },
  /** Approves a selected return request. */
  approveReturn: async function (request) {
    let model = this.model(request);
    let result = await SERVICE.DefaultReturnRequestService.approveReturn(
      this.serviceRequest(request, model, "returnRequest"),
    );
    return this.summary(result, "APPROVE_RETURN", {
      valid: true,
      returnRequest: result,
    });
  },
  /** Closes a selected return request. */
  closeReturn: async function (request) {
    let model = this.model(request);
    let result = await SERVICE.DefaultReturnRequestService.closeReturn(
      this.serviceRequest(request, model, "returnRequest"),
    );
    return this.summary(result, "CLOSE_RETURN", {
      valid: true,
      returnRequest: result,
    });
  },
};
