/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/src/schemas/schemas
 * @description Defines profile schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  profile: {
    tenant: {
      super: "super",
      backoffice: {
        enabled: true,
        label: "Tenant",
        displayProperty: "code",
        displayProperties: ["code", "description"],
      },
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      cache: {
        enabled: true,
        ttl: 100,
      },
      router: {
        enabled: true,
      },
      tenants: ["default"],
      definition: {
        properties: {
          type: "object",
          required: false,
          description: "JSON formate of properties defined for this tenant",
          searchOptions: {
            enabled: true, // default is false
          },
        },
      },
    },

    address: {
      super: "base",
      backoffice: {
        enabled: true,
        label: "Address",
        displayProperty: "code",
        operations: ["search", "read", "create", "update", "delete"],
        relationships: {
          contacts: {
            targetModule: "profile",
            actions: ["SELECT_EXISTING", "CREATE_RELATED"],
          },
        },
      },
      schemaPolicies: ["customerOwned"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      cache: {
        enabled: false,
        ttl: 360,
      },
      search: {
        enabled: false,
        idPropertyName: "code", // if null, code will be taken
      },
      refSchema: {
        contacts: {
          enabled: true,
          schemaName: "contact",
          type: "many",
          propertyName: "code",
          onTargetDelete: "RESTRICT",
        },
      },
      definition: {
        type: {
          type: "string",
          required: true,
          description: "Type of address, like home, office",
        },
        isPrimery: {
          type: "bool",
          required: true,
          default: false,
          label: "Primary address",
          description: "Indicates whether this is the default address",
        },
        flatNo: {
          type: "string",
          required: false,
          description: "Flat number of the address",
        },
        building: {
          type: "string",
          required: false,
          description: "Name of Building of the address",
        },
        street: {
          type: "string",
          required: false,
          description: "Street name of the address",
        },
        addressLine1: {
          type: "string",
          required: false,
          description: "Can be used for landmark or optional properties",
        },
        addressLine2: {
          type: "string",
          required: false,
          description: "Can be used for landmark or optional properties",
        },
        locality: {
          type: "string",
          required: false,
          description: "Locality of the address",
        },
        city: {
          type: "string",
          required: true,
          description: "City of the address",
        },
        state: {
          type: "string",
          required: true,
          description: "State of the address",
        },
        postalCode: {
          type: "string",
          required: true,
          description: "PastalCode of the address",
        },
        contacts: {
          type: "array",
          required: false,
          description: "All associated contacts with this enterprise",
        },
      },
    },

    contact: {
      super: "base",
      backoffice: {
        enabled: true,
        label: "Contact",
        displayProperty: "code",
        operations: ["search", "read", "create", "update", "delete"],
      },
      schemaPolicies: ["customerOwned"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      definition: {
        prefix: {
          type: "string",
          required: false,
          description: "Add prefix if any like country code for mobile number",
        },
        type: {
          enum: [
            ENUMS.ContactType.EMAIL.key,
            ENUMS.ContactType.PHONE.key,
            ENUMS.ContactType.FAX.key,
            ENUMS.ContactType.PAGER.key,
          ],
          required: true,
          description:
            "Required value could be only in [EMAIL, PHONE, FAX, PAGER]",
        },
        value: {
          type: "string",
          required: true,
          description: "Required value of respective type",
        },
        priority: {
          type: "int",
          required: true,
          default: 0,
        },
      },
    },

    enterprise: {
      super: "base",
      backoffice: {
        enabled: true,
        label: "Enterprise",
        displayProperty: "code",
        displayProperties: ["code", "description"],
      },
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      cache: {
        enabled: true,
        ttl: 360,
      },
      router: {
        enabled: true,
      },
      tenants: ["default"], // if not null, only tenant will be used
      search: {
        enabled: false,
        //indexName: 'enterprise', // if null, moduleName will be taken
        idPropertyName: "code", // if null, code will be taken
      },
      refSchema: {
        tenant: {
          enabled: true,
          schemaName: "tenant",
          type: "one",
          propertyName: "code",
          searchEnabled: true,
        },
        superEnterprise: {
          enabled: true,
          schemaName: "enterprise",
          type: "one",
          propertyName: "code",
        },
        subEnterprises: {
          enabled: true,
          schemaName: "enterprise",
          type: "many",
          propertyName: "code",
        },
        addresses: {
          enabled: true,
          schemaName: "address",
          type: "many",
          propertyName: "code",
        },
        contacts: {
          enabled: true,
          schemaName: "contact",
          type: "many",
          propertyName: "code",
        },
      },
      virtualProperties: {
        fullname: "DefaultEnterpriseVirtualService.getFullName",
        tenant: {
          fullname: "DefaultEnterpriseVirtualService.getFullName",
        },
      },
      definition: {
        name: {
          type: "string",
          required: true,
          description: "Name of enterprise",
          searchOptions: {
            enabled: true, // default is false
            default: "test",
          },
        },
        tenant: {
          type: "string",
          required: true,
          label: "Tenant",
          description: "Required Code of associated tenant",
          searchOptions: {
            enabled: true, // default is false
          },
        },
        superEnterprise: {
          type: "objectId",
          required: false,
          label: "Parent enterprise",
          description: "Parent enterprise code if any",
          searchOptions: {
            enabled: true, // default is false
          },
        },
        subEnterprises: {
          type: "array",
          required: false,
          label: "Sub-enterprises",
          description: "List of sub enterprises if any",
        },
        addresses: {
          type: "array",
          required: false,
          description: "All associated addresses with this enterprise",
          searchOptions: {
            enabled: true, // default is false
          },
        },
        contacts: {
          type: "array",
          required: false,
          description: "All associated contacts with this enterprise",
          searchOptions: {
            enabled: true, // default is false
          },
        },
      },
      indexes: {
        individual: {
          entTenant: {
            name: "tenant",
            enabled: true,
          },
        },
      },
    },

    userState: {
      super: "super",
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      definition: {
        personId: {
          type: "objectId",
          required: true,
        },
        loginId: {
          type: "string",
          required: true,
          description: "Required unique login id",
        },
        locked: {
          type: "bool",
          required: true,
          default: false,
          description: "Flag to check if user is locked",
        },
        attempts: {
          type: "int",
          required: true,
          default: 0,
          minimum: 0,
          maximum: 5,
          description: "must be an integer in [ 0, 5 ] and is required",
        },
      },
    },

    userGroup: {
      super: "base",
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      refSchema: {
        parentGroups: {
          enabled: true,
          schemaName: "userGroup",
          type: "many",
          propertyName: "code",
        },
      },
      definition: {
        name: {
          type: "string",
          required: true,
          description: "Name of the user group",
        },
        parentGroups: {
          type: "array",
          required: false,
          description: "List of parent groups",
        },
        permissions: {
          type: "array",
          required: false,
          description: "List of action permissions granted by this user group",
        },
      },
    },

    password: {
      super: "super",
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      definition: {
        loginId: {
          type: "string",
          required: true,
          description: "Required unique login id",
        },
        password: {
          type: "string",
          required: true,
          description: "Required password for the login",
        },
      },
    },

    user: {
      super: "base",
      model: false,
      service: {
        enabled: false,
      },
      router: {
        enabled: false,
      },
      refSchema: {
        password: {
          enabled: true,
          schemaName: "password",
          type: "one",
          propertyName: "_id",
        },
        userGroups: {
          enabled: true,
          schemaName: "userGroup",
          type: "many",
          propertyName: "code",
        },
        addresses: {
          enabled: true,
          schemaName: "address",
          type: "many",
          propertyName: "code",
        },
        contacts: {
          enabled: true,
          schemaName: "contact",
          type: "many",
          propertyName: "code",
        },
      },
      definition: {
        authVersion: {
          type: "int",
          required: false,
          default: 1,
          description:
            "Monotonic security stamp used to invalidate issued sessions",
        },
        identityMigrationVersion: {
          type: "int",
          required: false,
          description:
            "Last identity-governance migration applied to this principal",
        },
        principalType: {
          type: "string",
          required: true,
          description: "Principal category: human, service, or customer",
        },
        name: {
          type: "object",
          required: true,
        },
        "name.title": {
          type: "string",
          required: false,
          description: "Title for the user",
        },
        "name.firstName": {
          type: "string",
          required: true,
          description: "First name for the user",
        },
        "name.middleName": {
          type: "string",
          required: false,
          description: "Middle name for the user if any",
        },
        "name.lastName": {
          type: "string",
          required: true,
          description: "Last name for the user",
        },
        loginId: {
          type: "string",
          required: true,
          description: "Required unique login id",
        },
        password: {
          type: "objectId",
          required: true,
          description: "Required password for the login",
        },
        userGroups: {
          type: "array",
          required: true,
          description: "User group code for which this user belongs",
        },
        addresses: {
          type: "array",
          required: false,
          description: "All associated addresses with this enterprise",
        },
        contacts: {
          type: "array",
          required: false,
          description: "All associated contacts with this enterprise",
        },
      },

      indexes: {
        // composite: {
        //     indexName: {
        //         name: 'name',
        //         enabled: true,
        //         options: {
        //             unique: true
        //         }
        //     },
        //     indexName1: {
        //         name: 'name1',
        //         enabled: true,
        //         options: {
        //             unique: true
        //         }
        //     }
        // },
        individual: {
          indexLoginId: {
            name: "loginId",
            enabled: true,
            options: {
              unique: true,
            },
          },
        },
      },
    },

    employee: {
      super: "user",
      schemaPolicies: ["administrative"],
      backoffice: {
        displayProperty: "loginId",
        displayProperties: ["loginId", "name.firstName", "name.lastName"],
        searchableFields: [
          "loginId",
          "code",
          "name.firstName",
          "name.lastName",
        ],
        sortableFields: [
          "loginId",
          "code",
          "name.firstName",
          "name.lastName",
          "created",
          "updated",
        ],
        filterFields: [
          "loginId",
          "code",
          "name.firstName",
          "name.lastName",
          "principalType",
          "created",
          "updated",
        ],
        defaultSortField: "loginId",
        defaultSortDirection: "ASC",
        excludedFields: [
          "apiKeyPrefix",
          "apiKeyStatus",
          "apiKeyCreatedAt",
          "apiKeyExpiresAt",
          "apiKeyScopes",
        ],
      },
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      definition: {
        apiKey: {
          type: "string",
          required: false,
          description:
            "Legacy plaintext API key accepted only for governed migration and removed during rotation",
        },
        apiKeyHash: {
          type: "string",
          required: false,
          description:
            "Keyed digest used for service API-key lookup without persisting usable credential material",
        },
        apiKeyPrefix: {
          type: "string",
          required: false,
          description:
            "Non-secret API-key prefix used for operator identification",
        },
        apiKeyStatus: {
          type: "string",
          required: false,
          description: "API key lifecycle state: active, disabled, or revoked",
        },
        apiKeyCreatedAt: {
          type: "date",
          required: false,
        },
        apiKeyExpiresAt: {
          type: "date",
          required: false,
        },
        apiKeyScopes: {
          type: "array",
          required: false,
          description:
            "Optional least-privilege permissions granted to the API key",
        },
      },
    },

    customer: {
      super: "user",
      schemaPolicies: ["customerOwned"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      cache: {
        enabled: true,
        ttl: 20,
      },
    },

    principalScopeAssignment: {
      super: "base",
      schemaPolicies: ["administrative"],
      backoffice: {
        enabled: true,
        label: "Principal Scope Assignment",
        displayProperty: "code",
        displayProperties: [
          "code",
          "principalCode",
          "scopeType",
          "scopeCode",
          "effect",
          "status",
        ],
        searchableFields: [
          "code",
          "principalCode",
          "groupCode",
          "scopeCode",
          "permissionCode",
          "capabilityCode",
        ],
        sortableFields: [
          "code",
          "principalCode",
          "scopeType",
          "scopeCode",
          "effect",
          "status",
          "created",
          "updated",
        ],
        filterFields: [
          "principalType",
          "principalCode",
          "groupCode",
          "scopeType",
          "scopeCode",
          "effect",
          "status",
        ],
        defaultSortField: "code",
        defaultSortDirection: "ASC",
      },
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      cache: {
        enabled: true,
        ttl: 120,
      },
      refSchema: {
        groupCode: {
          enabled: true,
          schemaName: "userGroup",
          type: "one",
          propertyName: "code",
        },
        tenantCode: {
          enabled: true,
          schemaName: "tenant",
          type: "one",
          propertyName: "code",
        },
        enterpriseCode: {
          enabled: true,
          schemaName: "enterprise",
          type: "one",
          propertyName: "code",
        },
      },
      definition: {
        principalType: {
          type: "string",
          required: true,
          description:
            "Principal category receiving the scope, such as human, service, customer, or group",
        },
        principalCode: {
          type: "string",
          required: false,
          description:
            "Login id or stable code of the direct principal receiving the scope",
        },
        groupCode: {
          type: "string",
          required: false,
          description:
            "User group code when the scope is granted through group membership",
        },
        permissionCode: {
          type: "string",
          required: false,
          description: "Optional permission narrowed by this scope assignment",
        },
        capabilityCode: {
          type: "string",
          required: false,
          description:
            "Optional BackOffice or business capability narrowed by this scope assignment",
        },
        scopeType: {
          type: "string",
          required: true,
          description:
            "Business scope type such as GLOBAL, TENANT, ENTERPRISE, CATALOG, CHANNEL, STORE, REGION, or BUSINESS_UNIT",
        },
        scopeCode: {
          type: "string",
          required: true,
          description: "Stable code for the scoped object",
        },
        tenantCode: {
          type: "string",
          required: false,
          description: "Tenant context for scoped authorization",
        },
        enterpriseCode: {
          type: "string",
          required: false,
          description: "Enterprise context for scoped authorization",
        },
        effect: {
          type: "string",
          required: true,
          description: "ALLOW or DENY effect for the assignment",
        },
        inheritanceMode: {
          type: "string",
          required: true,
          description:
            "How the scope assignment applies: DIRECT, GROUP, or GROUP_AND_DESCENDANTS",
        },
        status: {
          type: "string",
          required: true,
          description: "Lifecycle status for the assignment",
        },
        effectiveFrom: {
          type: "date",
          required: false,
          description: "Optional start time for this assignment",
        },
        effectiveTo: {
          type: "date",
          required: false,
          description: "Optional end time for this assignment",
        },
        reasonCode: {
          type: "string",
          required: false,
          description: "Operator-facing reason for the scope assignment",
        },
      },
      indexes: {
        individual: {
          principalType: { name: "principalType", enabled: true },
          principalCode: { name: "principalCode", enabled: true },
          groupCode: { name: "groupCode", enabled: true },
          scopeType: { name: "scopeType", enabled: true },
          scopeCode: { name: "scopeCode", enabled: true },
          status: { name: "status", enabled: true },
        },
      },
    },

    identityMigrationAudit: {
      super: "base",
      schemaPolicies: ["administrative"],
      model: true,
      service: { enabled: true },
      event: { enabled: false },
      router: { enabled: false },
      definition: {
        migrationVersion: { type: "int", required: true },
        status: { type: "string", required: true },
        tenant: { type: "string", required: true },
        requestedBy: { type: "string", required: false },
        preview: { type: "object", required: false },
        snapshot: { type: "object", required: false },
        result: { type: "object", required: false },
        correlationId: { type: "string", required: false },
      },
    },
  },
};
