/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module complianceCore/config/properties
 * @description Defines generated configurable defaults for complianceCore.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    backofficeCapabilities: {
        complianceCore: {
            enabled: true,
            capabilityId: 'compliance-management',
            displayName: 'Compliance Management',
            category: 'governance',
            icon: 'compliance',
            contractVersion: 1,
            minimumClientContractVersion: 1,
            roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            requiredPermissions: ['compliance.management.read'],
            navigation: [{
                id: 'compliance-management',
                label: 'Compliance Management',
                route: '/compliance-management',
                icon: 'compliance',
                order: 100,
                group: { id: 'compliance-management', label: 'Compliance Management', order: 220 },
                perspectives: ['operations', 'configuration', 'audit'],
                contexts: ['tenant', 'enterprise'],
                help: {
                    summary: 'Manage backend-authorized compliance configuration, operational queues, decisions, evidence, and audit views.',
                    documentationRoute: '/docs/reference/compliance-management',
                    documentationFragment: 'business-overview'
                },
                featureState: 'ACTIVE',
                requiredPermissions: ['compliance.management.read']
            }]
        }
    },
    compliance: {
        presentation: {
            sectionId: 'compliance-management',
            sectionLabel: 'Compliance Management',
            exposeBackendAuthorizedNavigationOnly: true,
            maskSensitiveValuesByDefault: true,
            exposeProviderSecrets: false,
            exposeRawEvidence: false
        },
        governance: {
            tenantScopedByDefault: true,
            enterpriseScopeRequiresExplicitPermission: true,
            makerCheckerForSensitiveChanges: true,
            immutableAuditRequired: true,
            legalHoldOverridesDeletion: true
        },
        kycEnforcement: {
            enabled: true,
            failClosed: true,
            requiredByEntryPoint: { ONBOARDING: true, CHECKOUT: true, PAYMENT: true, REFUND: true, ORDER: true },
            remoteRoute: '/nodics/kyc/v0/eligibility/evaluate',
            decisionCacheSeconds: 300
        }
    }
};
