/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require("assert");
const _ = require("lodash");
const authProperties = require("../../../gFramework/nAuth/config/properties");

// @nodics-capability-behavior @nodics-area profile
global.CONFIG = {
  get: function (key) {
    if (key === "bootstrapIdentity") {
      return {
        source: "test",
        adminPassword: "test-admin-password-12345",
        servicePassword: "test-service-password-12345",
        serviceApiKey: "test-service-api-key-value-12345678901234567890",
      };
    }
    if (key === "authSecurity") {
      return _.merge({}, authProperties.authSecurity, {
        compatibility: {
          allowLocalBootstrapIdentity: true,
        },
      });
    }
    return undefined;
  },
};

const commonUtils = require("../../../gFramework/nCommon/src/utils/utils");
global.UTILS = Object.assign({}, commonUtils, {
  isObject: function (value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  },
});

const userGroupsData = require("../data/init/data/groups/defaultBootstrapUserGroupsData");
const employeeData = require("../data/init/data/user/defaultEmployeeData");
let groupTree = [
  {
    code: "runtimeConfigAdminUserGroup",
    permissions: [
      "runtime.config.cleanup.execute",
      "backoffice.contract.approve",
      "backoffice.contract.reject",
      "backoffice.contract.rollback",
    ],
    parentGroups: [
      {
        code: "runtimeConfigOperatorUserGroup",
        permissions: [
          "runtime.config.request.activate",
          "runtime.config.rollback",
          "runtime.config.cleanup.preview",
        ],
        parentGroups: [
          {
            code: "runtimeConfigRequesterUserGroup",
            permissions: [
              "runtime.config.preview",
              "runtime.config.request.create",
            ],
            parentGroups: [
              {
                code: "runtimeConfigViewerUserGroup",
                permissions: [
                  "runtime.config.history.view",
                  "runtime.config.summary.view",
                  "runtime.config.request.view",
                  "system.contract.openapi.view",
                  "backoffice.registry.view",
                  "backoffice.bootstrap.view",
                  "backoffice.contract.view",
                ],
              },
            ],
          },
        ],
      },
      {
        code: "runtimeConfigApproverUserGroup",
        permissions: [
          "runtime.config.request.approve",
          "runtime.config.request.reject",
        ],
      },
    ],
  },
];

let permissions = global.UTILS.getUserGroupPermissions(groupTree);
assert(permissions.includes("runtime.config.cleanup.execute"));
assert(permissions.includes("runtime.config.cleanup.preview"));
assert(permissions.includes("runtime.config.preview"));
assert(permissions.includes("runtime.config.request.view"));
assert(permissions.includes("system.contract.openapi.view"));
assert(permissions.includes("backoffice.registry.view"));
assert(permissions.includes("backoffice.bootstrap.view"));
assert(permissions.includes("backoffice.contract.view"));
assert(permissions.includes("backoffice.contract.approve"));
assert(permissions.includes("runtime.config.request.approve"));
assert.strictEqual(
  permissions.filter(
    (permission) => permission === "runtime.config.request.view",
  ).length,
  1,
);

let runtimeAdminGroup = Object.values(userGroupsData).find(
  (group) => group.code === "runtimeConfigAdminUserGroup",
);
let runtimeViewerGroup = Object.values(userGroupsData).find(
  (group) => group.code === "runtimeConfigViewerUserGroup",
);
let platformAdminGroup = Object.values(userGroupsData).find(
  (group) => group.code === "adminGroup",
);
assert(
  runtimeAdminGroup,
  "Default runtime config admin group should be seeded",
);
assert(
  platformAdminGroup.permissions.includes("system.schema.workbench.view"),
  "Default platform administrators should be allowed to discover the governed Schema Workbench",
);
assert(
  platformAdminGroup.permissions.includes("backoffice.registry.admin.view"),
  "Default platform administrators should be allowed to inspect sanitized module health",
);
assert(
  platformAdminGroup.permissions.includes("backoffice.registry.refresh"),
  "Default platform administrators should be allowed to request a bounded module-health refresh",
);
[
  "order.backoffice.read",
  "order.cancellation.support.read",
  "order.return.support.read",
  "order.refund.support.read",
  "order.lifecycle.approval.read",
  "order.lifecycle.operations.diagnostics",
  "order.lifecycle.policy.read",
  "order.lifecycle.reason.read",
].forEach((permission) =>
  assert(
    platformAdminGroup.permissions.includes(permission),
    "Default platform administrators should be allowed to validate Order lifecycle Axis workspaces: " + permission,
  ),
);
assert(runtimeViewerGroup.permissions.includes("system.contract.openapi.view"));
assert(
  runtimeAdminGroup.permissions.includes("runtime.config.cleanup.execute"),
);
assert(
  runtimeAdminGroup.permissions.includes(
    "backoffice.registry.diagnostics.view",
  ),
);
assert(runtimeViewerGroup.permissions.includes("backoffice.contract.view"));
[
  "backoffice.contract.approve",
  "backoffice.contract.reject",
  "backoffice.contract.rollback",
].forEach((permission) =>
  assert(
    runtimeAdminGroup.permissions.includes(permission),
    "Runtime admin must include " + permission,
  ),
);
["ai.knowledge.read", "ai.knowledge.manage"].forEach((permission) =>
  assert(
    runtimeAdminGroup.permissions.includes(permission),
    "Runtime admin must include " + permission,
  ),
);
[
  "profile.backoffice.view",
  "cms.backoffice.view",
  "cronjob.backoffice.view",
  "workflow.backoffice.view",
  "pricing.backoffice.read",
  "pricing.backoffice.preview",
  "pricing.backoffice.manage",
  "payment.backoffice.read",
  "payment.backoffice.manage",
  "fulfillment.backoffice.read",
  "fulfillment.backoffice.manage",
].forEach((permission) =>
  assert(
    runtimeAdminGroup.permissions.includes(permission),
    "Runtime admin must include " + permission,
  ),
);
let contentGroup = Object.values(userGroupsData).find(
  (group) => group.code === "contentUserGroup",
);
assert(contentGroup.permissions.includes("cms.backoffice.view"));
[
  "system.log.level.update",
  "system.schema.index.rebuild",
  "system.schema.validator.rebuild",
  "system.test.unit.run",
  "system.test.nodics.run",
  "import.init.run",
  "import.core.run",
  "import.sample.run",
  "import.local.run",
  "import.contentPack.view",
  "import.contentPack.run",
  "export.run",
  "dynamo.class.view",
  "dynamo.class.snapshot.view",
  "dynamo.class.update",
  "dynamo.class.execute",
].forEach((permission) => {
  assert(
    runtimeAdminGroup.permissions.includes(permission),
    "Runtime admin group must include " + permission,
  );
});
assert(
  !runtimeAdminGroup.permissions.includes("*"),
  "Runtime admin data should avoid broad wildcard permissions",
);
const permissionCatalog = authProperties.identityGovernance.permissionCatalog;
Object.values(userGroupsData).forEach((group) =>
  (group.permissions || []).forEach((permission) => {
    assert(
      permissionCatalog.includes(permission),
      "Seeded user-group permission must exist in the permission catalog: " +
        permission,
    );
  }),
);

let adminEmployee = employeeData.record0;
let apiAdminEmployee = employeeData.record1;
assert(adminEmployee.userGroups.includes("runtimeConfigAdminUserGroup"));
assert(adminEmployee.userGroups.includes("adminGroup"));
assert(apiAdminEmployee.userGroups.includes("serviceAccountUserGroup"));
assert(!apiAdminEmployee.userGroups.includes("runtimeConfigAdminUserGroup"));
assert.strictEqual(apiAdminEmployee.principalType, "service");
assert.strictEqual(apiAdminEmployee.apiKeyStatus, "active");
assert.strictEqual(
  apiAdminEmployee.identityMigrationVersion,
  authProperties.identityGovernance.migration.version,
);

let baseUserGroup = Object.values(userGroupsData).find(
  (group) => group.code === "userGroup",
);
let adminGroup = Object.values(userGroupsData).find(
  (group) => group.code === "adminGroup",
);
assert(
  !baseUserGroup.parentGroups,
  "Base userGroup must not inherit administrative groups",
);
assert(
  adminGroup.parentGroups.includes("userGroup"),
  "Administrative groups should inherit the base user capability",
);

let inactiveGroup = {
  code: "inactive",
  active: false,
  permissions: ["forbidden.permission"],
};
assert.deepStrictEqual(
  global.UTILS.getUserGroupPermissions([inactiveGroup]),
  [],
);

console.log("Profile user group permission resolution validated");
