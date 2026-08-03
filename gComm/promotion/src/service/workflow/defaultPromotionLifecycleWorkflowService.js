/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/service/workflow/DefaultPromotionLifecycleWorkflowService
 * @description Adapts Promotion lifecycle approval, rejection, repair, and reconciliation requests to Nodics Workflow-owned processes.
 * @layer service
 * @owner promotion
 * @override Customer modules may layer stricter approval policy, additional workflow operations, or project repair services while preserving immutable Promotion evidence and Workflow/nPipeline authority.
 */
module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  config: function () {
    return (CONFIG.get("promotion") || {}).workflow || {};
  },
  reconciliationConfig: function () {
    return (CONFIG.get("promotion") || {}).reconciliation || {};
  },
  error: function (code, message) {
    return new CLASSES.NodicsError(message, null, code);
  },
  items: function (value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (value.result !== undefined) {
      return Array.isArray(value.result) ? value.result : [value.result];
    }
    if (Array.isArray(value.items)) return value.items;
    return [value];
  },
  isServiceIdentity: function (request) {
    return Boolean(
      request && request.authData && request.authData.tokenType === "service",
    );
  },
  isHumanIdentity: function (request) {
    return Boolean(
      request && request.authData && request.authData.tokenType !== "service",
    );
  },
  principalId: function (request) {
    return (
      (request && request.authData && request.authData.principalId) ||
      (request && request.authData && request.authData.code) ||
      (request && request.authData && request.authData.userCode) ||
      "system"
    );
  },
  operationType: function (subject) {
    return (
      (subject && subject.lifecycleOperation) ||
      (subject && subject.operationType) ||
      "APPROVE_CAMPAIGN"
    );
  },
  policy: function (subject) {
    const config = this.config();
    const operation = this.operationType(subject);
    const mode = (
      (config.operationModes || {})[operation] ||
      config.defaultMode ||
      "MANUAL"
    ).toUpperCase();
    if (!(config.modes || ["MANUAL", "AUTOMATIC"]).includes(mode)) {
      throw this.error(
        "ERR_PROMOTION_00020",
        "Promotion workflow mode is invalid",
      );
    }
    return {
      enabled: config.enabled !== false,
      operation: operation,
      mode: mode,
      workflowCode:
        mode === "AUTOMATIC"
          ? config.automaticWorkflowCode
          : config.manualWorkflowCode,
    };
  },
  subjectCode: function (subject, operation) {
    return (
      subject.workflowSubjectCode ||
      subject.campaignCode ||
      subject.ruleCode ||
      subject.evaluationCode ||
      subject.code ||
      operation
    );
  },
  start: async function (subject, request) {
    const policy = this.policy(subject || {});
    if (!policy.enabled || !SERVICE.DefaultWorkflowService) {
      return Object.assign({}, subject, {
        workflowSkipped: true,
        workflowOperation: policy.operation,
      });
    }
    const code = this.subjectCode(subject || {}, policy.operation);
    const carrierCode =
      (subject && subject.workflowCarrierCode) ||
      [policy.operation, code, "workflow"].join(":");
    if (
      SERVICE.DefaultWorkflowCarrierService &&
      typeof SERVICE.DefaultWorkflowCarrierService.isCarrierAvailable ===
        "function" &&
      (await SERVICE.DefaultWorkflowCarrierService.isCarrierAvailable({
        tenant: request.tenant,
        authData: request.authData,
        carrierCode: carrierCode,
      }))
    ) {
      return Object.assign({}, subject, {
        workflowCarrierCode: carrierCode,
        workflowCode: policy.workflowCode,
      });
    }
    await SERVICE.DefaultWorkflowService.initCarrier({
      tenant: request.tenant,
      authData: request.authData,
      workflowCode: policy.workflowCode,
      releaseCarrier: true,
      carrier: {
        code: carrierCode,
        event: { enabled: true },
        sourceDetail: {
          processType: "promotionLifecycle",
          enterpriseCode:
            subject.enterpriseCode ||
            request.enterpriseCode ||
            request.entCode ||
            (request.authData && request.authData.enterpriseCode),
          operationType: policy.operation,
          approvalMode: policy.mode,
          campaignCode: subject.campaignCode,
          ruleCode: subject.ruleCode,
          evaluationCode: subject.evaluationCode,
          idempotencyKey: request.idempotencyKey,
        },
        items: [
          {
            code: code,
            schemaName: this.schemaNameFor(policy.operation),
            refId: code,
            itemDetail: {
              operationType: policy.operation,
              approvalMode: policy.mode,
            },
          },
        ],
      },
    });
    return Object.assign({}, subject, {
      workflowCarrierCode: carrierCode,
      workflowCode: policy.workflowCode,
    });
  },
  schemaNameFor: function (operation) {
    if (operation === "APPROVE_RULE") return "promotionRule";
    if (operation === "REPAIR_EVALUATION" || operation === "RECONCILE_EVIDENCE")
      return "promotionEvaluationRun";
    return "promotionCampaign";
  },
  context: function (request) {
    const carrier = (request && request.workflowCarrier) || {};
    const source = carrier.sourceDetail || {};
    if (
      !carrier.code ||
      source.processType !== "promotionLifecycle" ||
      !source.operationType ||
      !["MANUAL", "AUTOMATIC"].includes(source.approvalMode)
    ) {
      throw this.error(
        "ERR_PROMOTION_00020",
        "Promotion workflow carrier is invalid",
      );
    }
    return { carrier: carrier, source: source };
  },
  serviceFor: function (operation) {
    if (operation === "APPROVE_RULE")
      return SERVICE.DefaultPromotionRuleService;
    if (operation === "REPAIR_EVALUATION" || operation === "RECONCILE_EVIDENCE")
      return SERVICE.DefaultPromotionEvaluationRunService;
    return SERVICE.DefaultPromotionCampaignService;
  },
  identityQueryFor: function (operation, source) {
    if (operation === "APPROVE_RULE") return { ruleCode: source.ruleCode };
    if (operation === "REPAIR_EVALUATION" || operation === "RECONCILE_EVIDENCE")
      return { evaluationCode: source.evaluationCode };
    return { campaignCode: source.campaignCode };
  },
  loadSubject: async function (operation, source, request) {
    const service = this.serviceFor(operation);
    if (!service || typeof service.get !== "function") return undefined;
    const records = this.items(
      await service.get({
        tenant: request.tenant,
        authData: request.authData,
        query: this.identityQueryFor(operation, source),
        searchOptions: { limit: 1 },
      }),
    );
    return records[0];
  },
  updateLifecycle: async function (operation, source, request, status) {
    const service = this.serviceFor(operation);
    if (!service || typeof service.update !== "function") {
      return { updated: false, status: status };
    }
    const subject = await this.loadSubject(operation, source, request);
    const query =
      subject && subject.code
        ? { code: subject.code }
        : this.identityQueryFor(operation, source);
    const identity =
      operation === "APPROVE_RULE"
        ? { ruleCode: source.ruleCode }
        : { campaignCode: source.campaignCode };
    const model = Object.assign(identity, {
      status: status,
      workflowCarrierCode:
        source.workflowCarrierCode || request.workflowCarrier.code,
      lastWorkflowDecision: status,
    });
    if (status === "ACTIVE") {
      model.approvedBy = this.principalId(request);
      model.approvedAt = new Date();
    }
    return service.update({
      tenant: request.tenant,
      authData: request.authData,
      query: query,
      model: model,
    });
  },
  approve: async function (request) {
    const context = this.context(request);
    if (!this.isHumanIdentity(request)) {
      throw this.error(
        "ERR_PROMOTION_00021",
        "Promotion manual approval requires human identity",
      );
    }
    if (
      !["APPROVE_CAMPAIGN", "APPROVE_RULE"].includes(
        context.source.operationType,
      )
    ) {
      throw this.error(
        "ERR_PROMOTION_00020",
        "Promotion workflow approval target is invalid",
      );
    }
    await this.updateLifecycle(
      context.source.operationType,
      context.source,
      request,
      "ACTIVE",
    );
    return {
      decision: "SUCCESS",
      type: "SUCCESS",
      feedback: {
        operationType: context.source.operationType,
        status: "ACTIVE",
        carrierCode: context.carrier.code,
      },
    };
  },
  reject: async function (request) {
    const context = this.context(request);
    if (!this.isHumanIdentity(request)) {
      throw this.error(
        "ERR_PROMOTION_00021",
        "Promotion manual rejection requires human identity",
      );
    }
    if (
      !["APPROVE_CAMPAIGN", "APPROVE_RULE"].includes(
        context.source.operationType,
      )
    ) {
      throw this.error(
        "ERR_PROMOTION_00020",
        "Promotion workflow rejection target is invalid",
      );
    }
    await this.updateLifecycle(
      context.source.operationType,
      context.source,
      request,
      "REJECTED",
    );
    return {
      decision: "REJECT",
      type: "REJECT",
      feedback: {
        operationType: context.source.operationType,
        status: "REJECTED",
        carrierCode: context.carrier.code,
      },
    };
  },
  complete: async function (request) {
    const context = this.context(request);
    if (context.source.approvalMode === "MANUAL") {
      if (!this.isHumanIdentity(request)) {
        throw this.error(
          "ERR_PROMOTION_00021",
          "Manual Promotion workflow action requires human identity",
        );
      }
      const decision =
        (request.feedback && request.feedback.decision) ||
        (request.workflowFeedback && request.workflowFeedback.decision) ||
        "SUCCESS";
      return decision === "REJECT"
        ? this.reject(request)
        : this.approve(request);
    }
    if (!this.isServiceIdentity(request)) {
      throw this.error(
        "ERR_PROMOTION_00021",
        "Automatic Promotion workflow action requires service identity",
      );
    }
    return this.repair({
      tenant: request.tenant,
      authData: request.authData,
      repairRequest: {
        carrierCode: context.carrier.code,
        operationType: context.source.operationType,
        enterpriseCode: context.source.enterpriseCode,
        evaluationCode: context.source.evaluationCode,
      },
    });
  },
  repair: async function (request) {
    if (!this.isServiceIdentity(request)) {
      throw this.error(
        "ERR_PROMOTION_00021",
        "Promotion repair requires service identity",
      );
    }
    const repairRequest = request.repairRequest || {};
    if (
      SERVICE.DefaultPromotionRepairService &&
      typeof SERVICE.DefaultPromotionRepairService.repair === "function"
    ) {
      const repaired = await SERVICE.DefaultPromotionRepairService.repair({
        tenant: request.tenant,
        authData: request.authData,
        enterpriseCode: repairRequest.enterpriseCode,
        repairRequest: repairRequest,
      });
      return {
        decision: "SUCCESS",
        type: "SUCCESS",
        feedback: {
          status: repaired.status,
          operationType: repaired.operationType || repairRequest.operationType,
          carrierCode:
            repaired.workflowCarrierCode || repairRequest.carrierCode,
          evaluationCode:
            repaired.evaluationCode || repairRequest.evaluationCode,
          repairRunCode: repaired.repairRunCode,
        },
      };
    }
    return {
      decision: "SUCCESS",
      type: "SUCCESS",
      feedback: {
        status: "REPAIR_REQUESTED",
        operationType: repairRequest.operationType || "REPAIR_EVALUATION",
        carrierCode: repairRequest.carrierCode,
        evaluationCode: repairRequest.evaluationCode,
      },
    };
  },
  reconcile: async function (request) {
    if (!this.isServiceIdentity(request)) {
      throw this.error(
        "ERR_PROMOTION_00021",
        "Promotion reconciliation requires service identity",
      );
    }
    return {
      status: "RECONCILIATION_REQUESTED",
      maximumAggregateRecords: Number(
        this.reconciliationConfig().maximumAggregateRecords || 1000,
      ),
      repairableFailureCodes:
        this.reconciliationConfig().repairableFailureCodes || [],
    };
  },
};
