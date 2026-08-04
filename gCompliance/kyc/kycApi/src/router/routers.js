/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCompliance/kyc/kycApi/src/router/routers
 * @description Defines kyc route registration and HTTP exposure metadata.
 * @layer router
 * @owner kyc
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    kycApi: {
        complianceKyc: {
            submitCase: { secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['userGroup'], permission: 'kyc.case.submit', key: '/cases/submit', method: 'POST', controller: 'DefaultKycController', operation: 'submitCase', help: { requestType: 'secured', message: 'Create an idempotent KYC verification attempt using private nMedia document references and active consent evidence.' } },
            performCaseAction: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'kyc.review.action', key: '/cases/:caseCode/actions/:action', method: 'POST', controller: 'DefaultKycController', operation: 'performCaseAction', help: { requestType: 'secured', message: 'Run an explicit permissioned review intent; direct sensitive CRUD mutation is disabled.' } },
            performReviewTaskAction: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'kyc.review.task.action', key: '/reviews/:reviewTaskCode/actions/:action', method: 'POST', controller: 'DefaultKycController', operation: 'performReviewTaskAction', help: { requestType: 'secured', message: 'Assign, claim, escalate, request information, request a checker, decide, close, or expire one optimistic review task.' } },
            deliverDocument: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'kyc.document.deliver', key: '/cases/:caseCode/documents/:documentCode/deliver', method: 'POST', controller: 'DefaultKycController', operation: 'deliverDocument', help: { requestType: 'secured', message: 'Request audited purpose-bound preview or download through nMedia without exposing paths or private URLs.' } },
            evaluateEligibility: { secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permission: 'kyc.eligibility.evaluate', key: '/eligibility/evaluate', method: 'POST', controller: 'DefaultKycController', operation: 'evaluateEligibility', help: { requestType: 'secured', message: 'Return a KYC-owned reusable or verification-required decision for Profile, Checkout, Payment, Refund, or Order.' } },
            manageProvider: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'kyc.provider.manage', key: '/providers/:providerCode/actions/UPDATE', method: 'POST', controller: 'DefaultKycController', operation: 'manageProvider', help: { requestType: 'secured', message: 'Apply an optimistic, audited provider configuration change with independent approval for activation or production readiness.' } },
            manageProviderPolicy: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'kyc.policy.manage', key: '/provider-policies/:providerPolicyCode/actions/UPDATE', method: 'POST', controller: 'DefaultKycController', operation: 'manageProviderPolicy', help: { requestType: 'secured', message: 'Apply an optimistic, audited provider execution policy change with independent approval for live enablement.' } },
            operationsDashboard: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'compliance.management.read', key: '/management/dashboard', method: 'GET', controller: 'DefaultKycController', operation: 'summarizeOperations', help: { requestType: 'secured', message: 'Return bounded case, review SLA, provider readiness, and execution diagnostics for Axis Compliance Management.' } },
            providerWebhook: { secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permission: 'kyc.provider.webhook', key: '/providers/:providerCode/webhook', method: 'POST', controller: 'DefaultKycController', operation: 'handleProviderWebhook', help: { requestType: 'provider-callback', message: 'Accept only a signature-verified, replay-protected, tenant-mapped callback envelope.' } }
        },
        initKycWorkflow: {
            initMobileKyc: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/mobile/init',
                method: 'POST',
                controller: 'DefaultKycController',
                operation: 'initMobileKyc',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/v0/mobile/init',
                    body: {
                        refId: 'This is unique reference from the source, like loginId, orderId',
                        opsType: 'Required value could be only in [CUST_REG, EMP_REG, ORDER]',
                        description: 'This could have detail description about the KYC model',
                        item: {
                            // complete item detail that represent source information
                            mobileNumber: 'mandate where otp needs to be sent',
                            loginId: 'mandate to identify current user profile',
                            active: 'true/false'
                        },
                        event: {
                            enabled: 'true/false - if any workflow action needs to be triggered towards source system'
                        },
                        sourceDetail: {
                            schemaName: 'Either schema name or index name, in case internal',
                            moduleName: 'Required module name, in case internal',
                            endPoint: {
                                uri: "http://localhost:3000/nodics/profile/employee/authenticate",
                                header: {
                                    entCode: "default",
                                    loginId: "admin",
                                    password: "nodics"
                                },
                                methodName: "POST"
                            }
                        }
                    }
                }
            },
            initEmailKyc: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/email/init',
                method: 'POST',
                controller: 'DefaultKycController',
                operation: 'initEmailKyc',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/v0/email/init',
                    body: {
                        refId: 'This is unique reference from the source, loke loginId, orderId',
                        opsType: 'Required value could be only in [CUST_REG, EMP_REG, ORDER]',
                        description: 'This could have detail description about the KYC model',
                        item: {
                            // complete item detail that represent source information
                            email: 'mandate where otp needs to be sent',
                            loginId: 'mandate to identify current user profile',
                            active: 'true/false'
                        },
                        event: {
                            enabled: 'true/false - if any workflow action needs to be triggered towards source system'
                        },
                        sourceDetail: {
                            schemaName: 'Either schema name or index name, in case internal',
                            moduleName: 'Required module name, in case internal',
                            endPoint: {
                                uri: "http://localhost:3000/nodics/profile/employee/authenticate",
                                header: {
                                    entCode: "default",
                                    loginId: "admin",
                                    password: "nodics"
                                },
                                methodName: "POST"
                            }
                        }
                    }
                }
            }
        },
        validateKycWorkflow: {
            validateMobileKyc: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/mobile/validate',
                method: 'POST',
                controller: 'DefaultKycController',
                operation: 'validateMobileKyc',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/v0/mobile/init',
                    body: {
                        refId: 'This is unique reference from the source, loke loginId, orderId',
                        opsType: 'Required value could be only in [CUST_REG, EMP_REG, ORDER]',
                        otp: {
                            key: 'mobile number',
                            ops: 'customer/employee login id',
                            value: 'otp value'
                        }
                    }
                }
            }
        }
    }
};
