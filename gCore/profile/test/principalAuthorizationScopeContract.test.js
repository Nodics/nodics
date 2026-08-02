/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require("assert");

global.CONFIG = {
  get: function (key) {
    if (key === "principalAuthorizationScopes")
      return require("../config/properties").principalAuthorizationScopes;
    if (key === "schemaPolicies")
      return require("../config/properties").schemaPolicies;
    return undefined;
  },
};
global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(code, message) {
      super(message || code);
      this.code = code;
    }
  },
};
global.ENUMS = {
  ContactType: {
    EMAIL: { key: "EMAIL" },
    PHONE: { key: "PHONE" },
    FAX: { key: "FAX" },
    PAGER: { key: "PAGER" },
  },
};

const scopeGovernance = require("../src/service/identity/defaultPrincipalScopeGovernanceService");
const schemaHandler = require("../../../gFramework/nDatabase/database/src/service/schema/defaultDatabaseSchemaHandlerService");
const profileSchemas = schemaHandler.applyNamedSchemaPolicies(
  "profile",
  require("../src/schemas/schemas").profile,
);

assert(
  profileSchemas.principalScopeAssignment,
  "Profile must publish principalScopeAssignment schema",
);
assert.strictEqual(
  profileSchemas.principalScopeAssignment.schemaPolicies[0],
  "administrative",
);
assert.strictEqual(
  profileSchemas.principalScopeAssignment.refSchema.tenantCode.schemaName,
  "tenant",
);
assert.strictEqual(
  profileSchemas.principalScopeAssignment.refSchema.enterpriseCode.schemaName,
  "enterprise",
);

assert.throws(
  () =>
    scopeGovernance.validateSave({
      model: {
        code: "badScope",
        principalType: "human",
        principalCode: "admin",
        scopeType: "UNKNOWN",
        scopeCode: "default",
        effect: "ALLOW",
        status: "ACTIVE",
        inheritanceMode: "DIRECT",
      },
    }),
  /Invalid principal authorization scope type/,
);

assert.throws(
  () =>
    scopeGovernance.validateSave({
      model: {
        code: "badTenantScope",
        principalType: "human",
        principalCode: "admin",
        scopeType: "TENANT",
        scopeCode: "default",
        effect: "ALLOW",
        status: "ACTIVE",
        inheritanceMode: "DIRECT",
      },
    }),
  /Tenant scope assignments require tenantCode/,
);

assert.throws(
  () =>
    scopeGovernance.validateSave({
      model: {
        code: "badGroupScope",
        principalType: "group",
        principalCode: "admin",
        groupCode: "contentCreatorGroup",
        scopeType: "ENTERPRISE",
        scopeCode: "default",
        enterpriseCode: "default",
        effect: "ALLOW",
        status: "ACTIVE",
        inheritanceMode: "GROUP",
      },
    }),
  /must not carry principalCode/,
);

assert.strictEqual(
  scopeGovernance.validateSave({
    model: {
      code: "adminDefaultEnterprise",
      principalType: "human",
      principalCode: "admin",
      scopeType: "ENTERPRISE",
      scopeCode: "default",
      enterpriseCode: "default",
      effect: "ALLOW",
      status: "ACTIVE",
      inheritanceMode: "DIRECT",
    },
  }),
  true,
);

let authData = {
  principalType: "human",
  loginId: "admin",
  userGroups: ["contentCreatorGroup"],
};
let resolved = scopeGovernance.resolveAssignments(
  authData,
  [
    {
      code: "adminDefaultEnterprise",
      principalType: "human",
      principalCode: "admin",
      scopeType: "ENTERPRISE",
      scopeCode: "default",
      enterpriseCode: "default",
      permissionCode: "cms.site.manage",
      effect: "ALLOW",
      status: "ACTIVE",
      inheritanceMode: "DIRECT",
    },
    {
      code: "groupContentCatalog",
      principalType: "group",
      groupCode: "contentCreatorGroup",
      scopeType: "CATALOG",
      scopeCode: "defaultContentCatalog",
      permissionCode: "cms.content.manage",
      effect: "ALLOW",
      status: "ACTIVE",
      inheritanceMode: "GROUP",
    },
    {
      code: "denyContentCatalog",
      principalType: "human",
      principalCode: "admin",
      scopeType: "CATALOG",
      scopeCode: "defaultContentCatalog",
      permissionCode: "cms.content.manage",
      effect: "DENY",
      status: "ACTIVE",
      inheritanceMode: "DIRECT",
    },
    {
      code: "inactiveStore",
      principalType: "human",
      principalCode: "admin",
      scopeType: "STORE",
      scopeCode: "disabledStore",
      effect: "ALLOW",
      status: "INACTIVE",
      inheritanceMode: "DIRECT",
    },
  ],
  { now: "2026-08-03T00:00:00.000Z" },
);

assert.strictEqual(resolved.principalCode, "admin");
assert.strictEqual(resolved.scopeCount, 1);
assert.strictEqual(resolved.scopes[0].scopeType, "ENTERPRISE");
assert.strictEqual(resolved.deniedScopes.length, 1);
assert.strictEqual(resolved.deniedScopes[0].scopeCode, "defaultContentCatalog");

(async function () {
  global.SERVICE = {
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ userGroups: ["serviceAccountUserGroup"] }),
    },
    DefaultPrincipalScopeAssignmentService: {
      get: (request) => {
        assert.deepStrictEqual(request.query, {
          code: "adminDefaultEnterprise",
        });
        return Promise.resolve({
          result: [
            {
              code: "adminDefaultEnterprise",
              principalType: "human",
              principalCode: "admin",
              scopeType: "ENTERPRISE",
              scopeCode: "default",
              enterpriseCode: "default",
              effect: "ALLOW",
              status: "ACTIVE",
              inheritanceMode: "DIRECT",
            },
          ],
        });
      },
    },
  };
  await scopeGovernance.validateUpdate({
    tenant: "default",
    query: { code: "adminDefaultEnterprise" },
    model: { status: "INACTIVE" },
  });
  console.log("Profile principal authorization scope contract validated");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
