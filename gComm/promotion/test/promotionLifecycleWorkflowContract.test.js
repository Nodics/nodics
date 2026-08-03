/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/test/promotionLifecycleWorkflowContract
 * @description Protects Promotion lifecycle approval and repair as Workflow-owned business processes.
 * @layer test
 * @owner promotion
 * @override Project modules may replace workflow heads, actions, channels, and repair services while preserving Promotion evidence immutability and human/service identity separation.
 */
const assert = require("assert");

global.ENUMS = {
  WorkflowActionType: {
    AUTO: { key: "AUTO" },
    MANUAL: { key: "MANUAL" },
  },
  WorkflowActionPosition: {
    HEAD: { key: "HEAD" },
  },
};

const properties = require("../config/properties");
const schemas = require("../src/schemas/schemas");
const workflowHeads = require("../data/init/data/workflow/defaultPromotionLifecycleWorkflowHeadData");
const workflowActions = require("../data/init/data/workflow/defaultPromotionLifecycleWorkflowActionData");
const workflowChannels = require("../data/init/data/workflow/defaultPromotionLifecycleWorkflowChannelData");
const workflowHeadHeader = require("../data/init/headers/workflow/defaultPromotionLifecycleWorkflowHeadHeader");
const workflowActionHeader = require("../data/init/headers/workflow/defaultPromotionLifecycleWorkflowActionHeader");
const workflowChannelHeader = require("../data/init/headers/workflow/defaultPromotionLifecycleWorkflowChannelHeader");

assert.strictEqual(properties.promotion.workflow.enabled, true);
assert.strictEqual(
  properties.promotion.workflow.manualWorkflowCode,
  "promotionLifecycleManualFlow",
);
assert.strictEqual(
  properties.promotion.workflow.automaticWorkflowCode,
  "promotionLifecycleAutomaticFlow",
);
assert.strictEqual(
  properties.promotion.workflow.operationModes.APPROVE_CAMPAIGN,
  "MANUAL",
);
assert.strictEqual(
  properties.promotion.workflow.operationModes.REPAIR_EVALUATION,
  "AUTOMATIC",
);
assert.strictEqual(
  properties.promotion.reconciliation.repairableFailureCodes.includes(
    "PROMOTION_EVIDENCE_INCOMPLETE",
  ),
  true,
);

assert.strictEqual(
  schemas.promotion.promotionCampaign.definition.workflowCarrierCode.required,
  false,
);
assert.strictEqual(
  schemas.promotion.promotionCampaign.definition.approvedBy.required,
  false,
);
assert.strictEqual(
  schemas.promotion.promotionRule.definition.lastWorkflowDecision.required,
  false,
);
assert.strictEqual(
  schemas.promotion.promotionEvaluationRun.definition.workflowCarrierCode
    .required,
  false,
  "evaluation evidence may reference workflow but remains immutable",
);

assert.strictEqual(workflowHeads.manual.code, "promotionLifecycleManualFlow");
assert.strictEqual(
  workflowHeads.automatic.code,
  "promotionLifecycleAutomaticFlow",
);
assert.strictEqual(
  workflowHeads.manual.handler,
  "DefaultWorkflowActionExecutionService.performHeadOperation",
);
assert.strictEqual(workflowActions.manualReview.type, "MANUAL");
assert.strictEqual(
  workflowActions.manualComplete.handler,
  "DefaultPromotionLifecycleWorkflowService.complete",
);
assert.strictEqual(
  workflowActions.automaticComplete.handler,
  "DefaultPromotionLifecycleWorkflowService.complete",
);
assert.strictEqual(
  workflowChannels.manualReview.target,
  "promotionLifecycleManualReviewAction",
);
assert.strictEqual(
  workflowChannels.manualReject.target,
  "promotionLifecycleManualRejectAction",
);
assert.strictEqual(
  workflowHeadHeader.workflow.defaultPromotionLifecycleWorkflowHead.options
    .schemaName,
  "workflowAction",
);
assert.strictEqual(
  workflowActionHeader.workflow.defaultPromotionLifecycleWorkflowAction.options
    .schemaName,
  "workflowAction",
);
assert.strictEqual(
  workflowChannelHeader.workflow.defaultPromotionLifecycleWorkflowChannel
    .options.schemaName,
  "workflowChannel",
);

global.CONFIG = {
  get: (key) => (key === "promotion" ? properties.promotion : undefined),
};

global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(message, cause, code) {
      super(String(message));
      this.cause = cause;
      this.code = code;
    }
  },
};

let submittedCarrier = null;
let updatedCampaign = null;
let updatedRule = null;

global.SERVICE = {
  DefaultWorkflowCarrierService: {
    isCarrierAvailable: async () => false,
  },
  DefaultWorkflowService: {
    initCarrier: async (request) => {
      submittedCarrier = request;
      return { result: true };
    },
  },
  DefaultPromotionCampaignService: {
    get: async () => ({
      result: [{ code: "summer-campaign", campaignCode: "summer" }],
    }),
    update: async (request) => {
      updatedCampaign = request;
      return { result: request.model };
    },
  },
  DefaultPromotionRuleService: {
    get: async () => ({ result: [{ code: "rule-1", ruleCode: "rule-1" }] }),
    update: async (request) => {
      updatedRule = request;
      return { result: request.model };
    },
  },
};

const workflowService = require("../src/service/workflow/defaultPromotionLifecycleWorkflowService");

(async () => {
  const submitted = await workflowService.start(
    {
      campaignCode: "summer",
      enterpriseCode: "default",
      lifecycleOperation: "APPROVE_CAMPAIGN",
    },
    {
      tenant: "default",
      authData: { tokenType: "access", principalId: "admin" },
      idempotencyKey: "promotion-approve-1",
    },
  );
  assert.strictEqual(submitted.workflowCode, "promotionLifecycleManualFlow");
  assert.strictEqual(
    submittedCarrier.workflowCode,
    "promotionLifecycleManualFlow",
  );
  assert.strictEqual(submittedCarrier.releaseCarrier, true);
  assert.strictEqual(
    submittedCarrier.carrier.sourceDetail.processType,
    "promotionLifecycle",
  );
  assert.strictEqual(
    submittedCarrier.carrier.sourceDetail.operationType,
    "APPROVE_CAMPAIGN",
  );
  assert.strictEqual(
    submittedCarrier.carrier.items[0].schemaName,
    "promotionCampaign",
  );

  await assert.rejects(
    () =>
      workflowService.complete({
        tenant: "default",
        authData: { tokenType: "service", principalId: "promotion" },
        workflowCarrier: {
          code: "APPROVE_CAMPAIGN:summer:workflow",
          sourceDetail: {
            processType: "promotionLifecycle",
            approvalMode: "MANUAL",
            operationType: "APPROVE_CAMPAIGN",
            campaignCode: "summer",
          },
        },
      }),
    /human identity/,
  );

  const approved = await workflowService.complete({
    tenant: "default",
    authData: { tokenType: "access", principalId: "admin" },
    workflowCarrier: {
      code: "APPROVE_CAMPAIGN:summer:workflow",
      sourceDetail: {
        processType: "promotionLifecycle",
        approvalMode: "MANUAL",
        operationType: "APPROVE_CAMPAIGN",
        campaignCode: "summer",
      },
    },
  });
  assert.strictEqual(approved.decision, "SUCCESS");
  assert.strictEqual(updatedCampaign.model.status, "ACTIVE");
  assert.strictEqual(updatedCampaign.model.campaignCode, "summer");
  assert.strictEqual(updatedCampaign.model.approvedBy, "admin");
  assert.strictEqual(
    updatedCampaign.model.workflowCarrierCode,
    "APPROVE_CAMPAIGN:summer:workflow",
  );

  const rejected = await workflowService.reject({
    tenant: "default",
    authData: { tokenType: "access", principalId: "manager" },
    workflowCarrier: {
      code: "APPROVE_RULE:rule-1:workflow",
      sourceDetail: {
        processType: "promotionLifecycle",
        approvalMode: "MANUAL",
        operationType: "APPROVE_RULE",
        ruleCode: "rule-1",
      },
    },
  });
  assert.strictEqual(rejected.decision, "REJECT");
  assert.strictEqual(updatedRule.model.status, "REJECTED");
  assert.strictEqual(updatedRule.model.ruleCode, "rule-1");

  await assert.rejects(
    () =>
      workflowService.complete({
        tenant: "default",
        authData: { tokenType: "access", principalId: "admin" },
        workflowCarrier: {
          code: "REPAIR_EVALUATION:eval-1:workflow",
          sourceDetail: {
            processType: "promotionLifecycle",
            approvalMode: "AUTOMATIC",
            operationType: "REPAIR_EVALUATION",
            evaluationCode: "eval-1",
          },
        },
      }),
    /service identity/,
  );

  const repaired = await workflowService.complete({
    tenant: "default",
    authData: { tokenType: "service", principalId: "promotion" },
    workflowCarrier: {
      code: "REPAIR_EVALUATION:eval-1:workflow",
      sourceDetail: {
        processType: "promotionLifecycle",
        approvalMode: "AUTOMATIC",
        operationType: "REPAIR_EVALUATION",
        evaluationCode: "eval-1",
      },
    },
  });
  assert.strictEqual(repaired.feedback.status, "REPAIR_REQUESTED");
  assert.strictEqual(repaired.feedback.evaluationCode, "eval-1");

  console.log("Promotion lifecycle Workflow contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
