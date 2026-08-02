/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/config/properties
 * @description Defines default profile configuration used during module startup and layering.
 * @layer config
 * @owner profile
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  schemaPolicies: {
    profile: {
      administrative: {
        accessGroups: {
          adminGroup: 10,
          runtimeConfigAdminUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
      customerOwned: {
        accessGroups: {
          adminGroup: 10,
          runtimeConfigAdminUserGroup: 10,
          serviceAccountUserGroup: 10,
          customerUserGroup: 10,
        },
        ownership: {
          enabled: true,
          ownerProperty: "ownerId",
          bypassGroups: {
            adminGroup: true,
            runtimeConfigAdminUserGroup: true,
            serviceAccountUserGroup: true,
          },
          subjectGroups: {
            customerUserGroup: true,
          },
          principalTypes: {
            customer: true,
          },
        },
      },
    },
  },
  backofficeCapabilities: {
    profile: {
      enabled: true,
      capabilityId: "identity-profile",
      displayName: "Profiles and Identity",
      category: "core",
      icon: "identity",
      contractVersion: 1,
      minimumClientContractVersion: 1,
      roles: ["AUTHENTICATION_PROVIDER", "FUNCTIONAL_CAPABILITY_PROVIDER"],
      discovery: {
        openApiPath: "/nodics/system/v0/contract/openapi/internal",
        contractVersion: 1,
      },
      requiredPermissions: ["profile.backoffice.view"],
      navigation: [
        {
          id: "customers",
          label: "Customers",
          route: "/profile",
          icon: "profile",
          order: 100,
          group: {
            id: "organization",
            label: "Customers and Organization",
            order: 400,
          },
          perspectives: ["operations"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "ACTIVE",
          requiredPermissions: ["profile.backoffice.view"],
        },
        {
          id: "customer-segments",
          label: "Customer Segments",
          route: "/profile/customer-segments",
          icon: "profile",
          order: 110,
          group: {
            id: "organization",
            label: "Customers and Organization",
            order: 400,
          },
          perspectives: ["operations"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
        },
        {
          id: "employees",
          label: "Employees",
          route: "/profile/employees",
          icon: "profile",
          order: 120,
          group: {
            id: "organization",
            label: "Customers and Organization",
            order: 400,
          },
          perspectives: ["operations"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
        },
        {
          id: "roles",
          label: "Roles",
          route: "/profile/roles",
          icon: "profile",
          order: 130,
          group: {
            id: "organization",
            label: "Customers and Organization",
            order: 400,
          },
          perspectives: ["operations"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
        },
        {
          id: "permission-groups",
          label: "Permission Groups",
          route: "/profile/permission-groups",
          icon: "profile",
          order: 140,
          group: {
            id: "organization",
            label: "Customers and Organization",
            order: 400,
          },
          perspectives: ["operations"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
        },
        {
          id: "enterprises",
          label: "Enterprises",
          route: "/profile/enterprises",
          icon: "profile",
          order: 150,
          group: {
            id: "organization",
            label: "Customers and Organization",
            order: 400,
          },
          perspectives: ["operations"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
        },
        {
          id: "business-units",
          label: "Business Units",
          route: "/profile/business-units",
          icon: "profile",
          order: 160,
          group: {
            id: "organization",
            label: "Customers and Organization",
            order: 400,
          },
          perspectives: ["operations"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
        },
      ],
    },
  },
  mandatoryBootstrapServices: {
    profileIdentity: {
      enabled: true,
      order: 100,
      service: "DefaultMandatoryIdentityBootstrapService",
    },
  },
  attemptsToLockAccount: 5,
  encryptSaltLength: 10,
  passwordLengthLimit: 25,
  forceAPIKeyGenerate: false,
  profileBrowserSession: {
    enabled: false,
    refreshCookieName: "nodics_axis_refresh",
    csrfCookieName: "nodics_axis_csrf",
    cookiePath: "/nodics/profile/v0/employee/browser",
    csrfCookiePath: "/",
    sameSite: "Strict",
    secure: true,
    maximumAgeSeconds: 86400,
  },

  enterpriseManagement: {
    search: {
      defaultResultCount: 25,
      maximumResultCount: 100,
      maximumPageNumber: 10000,
      maximumCodeLength: 128,
      maximumNameLength: 256,
      projectedFields: [
        "code",
        "name",
        "active",
        "tenant",
        "superEnterprise",
        "createdAt",
        "updatedAt",
      ],
    },
    create: {
      maximumCodeLength: 128,
      maximumNameLength: 256,
      projectedFields: [
        "code",
        "name",
        "active",
        "tenant",
        "superEnterprise",
        "createdAt",
      ],
    },
  },

  principalAuthorizationScopes: {
    enabled: true,
    principalTypes: ["human", "service", "customer", "group"],
    effects: ["ALLOW", "DENY"],
    statuses: ["ACTIVE", "INACTIVE", "EXPIRED"],
    scopeTypes: [
      "GLOBAL",
      "TENANT",
      "ENTERPRISE",
      "CATALOG",
      "CHANNEL",
      "STORE",
      "REGION",
      "BUSINESS_UNIT",
    ],
    inheritanceModes: ["DIRECT", "GROUP", "GROUP_AND_DESCENDANTS"],
    maximumAssignmentsPerPrincipal: 500,
    maximumScopeCodeLength: 128,
    defaultEffect: "ALLOW",
    defaultStatus: "ACTIVE",
    defaultInheritanceMode: "DIRECT",
  },

  profile: {
    jwtSignOptions: {
      expiresIn: "3h",
      algorithm: "HS256", // RSASSA [ "RS256", "RS384", "RS512" ]
    },
    jwtVerifyOptions: {
      algorithms: ["HS256"],
    },
    loginIdFormat: "default",
    loginIdFormatValidators: {
      email: "DefaultLoginIdAsEmailValidatorService",
    },
  },
};
