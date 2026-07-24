/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner backoffice
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
const contracts = require('../schemas/apiContracts');
const successEnvelope = dataSchema => ({
    type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: dataSchema }
});

module.exports = {
    backoffice: {
        registryControl: {
            register: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'serviceRegistry',
                key: '/registry/instances',
                method: 'PUT',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'register',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.registrationBatch } } },
                responses: { '200': { description: 'Runtime module leases registered', content: { 'application/json': {
                    schema: successEnvelope({ type: 'object', required: ['instanceId', 'registeredModules'], properties: {
                        instanceId: { type: 'string' }, registeredModules: { type: 'integer', minimum: 1 }
                    } })
                } } } }
            },
            deregister: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'serviceRegistry',
                key: '/registry/instances/:instanceId',
                method: 'DELETE',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'deregister'
            }
        },
        registryDiscovery: {
            publicBootstrap: {
                secured: false,
                publicAccess: true,
                accessGroups: ['userGroup'],
                apiExposure: 'serviceRegistry',
                key: '/bootstrap/public',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'publicBootstrap',
                help: { parameters: [{ name: 'x-nodics-client-contract-version', in: 'header', required: true,
                    description: 'Positive Axis client contract version.', schema: { type: 'integer', minimum: 1 } }] },
                responses: { '200': { description: 'Low-disclosure pre-authentication Axis bootstrap', content: { 'application/json': {
                    schema: successEnvelope(contracts.publicBootstrapData)
                } } } }
            },
            list: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.registry.view',
                apiExposure: 'serviceRegistry',
                key: '/registry/modules',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'list',
                responses: { '200': { description: 'Authorized client-safe module leases', content: { 'application/json': {
                    schema: successEnvelope(contracts.discoveryData)
                } } } }
            },
            bootstrap: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.bootstrap.view',
                apiExposure: 'serviceRegistry',
                key: '/bootstrap',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'bootstrap',
                help: { parameters: [{ name: 'x-nodics-client-contract-version', in: 'header', required: false,
                    description: 'Positive BackOffice client contract version; defaults to the configured minimum.', schema: { type: 'integer', minimum: 1 } }] },
                responses: { '200': { description: 'Authorized BackOffice client bootstrap', content: { 'application/json': {
                    schema: successEnvelope(contracts.bootstrapData)
                } } } }
            },
            diagnostics: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.registry.diagnostics.view',
                apiExposure: 'serviceRegistry',
                key: '/registry/diagnostics',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'diagnostics',
                responses: { '200': { description: 'Sanitized registry diagnostics', content: { 'application/json': {
                    schema: successEnvelope(contracts.diagnosticsData)
                } } } }
            },
            adminList: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.registry.admin.view', apiExposure: 'serviceRegistry',
                key: '/registry/admin/modules', method: 'GET', controller: 'DefaultBackofficeRegistryController', operation: 'adminList',
                help: { parameters: ['moduleName', 'capability', 'environment', 'server', 'state', 'compatibility'].map(name =>
                    ({ name: name, in: 'query', required: false, schema: { type: 'string' } })).concat([
                    { name: 'offset', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } },
                    { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } }
                ]) }, responses: { '200': { description: 'Bounded sanitized administrative module inventory', content: { 'application/json': {
                    schema: successEnvelope(contracts.adminListData)
                } } } }
            },
            adminDetail: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.registry.admin.view', apiExposure: 'serviceRegistry',
                key: '/registry/admin/modules/:moduleName', method: 'GET', controller: 'DefaultBackofficeRegistryController', operation: 'adminDetail',
                responses: { '200': { description: 'Sanitized administrative module detail', content: { 'application/json': {
                    schema: successEnvelope(contracts.adminDetailData)
                } } } }
            },
            refresh: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.registry.refresh', apiExposure: 'serviceRegistry',
                key: '/registry/admin/modules/:moduleName/refresh', method: 'POST', controller: 'DefaultBackofficeRegistryController', operation: 'refresh',
                responses: { '202': { description: 'Existing availability and discovery observers refreshed', content: { 'application/json': {
                    schema: successEnvelope(contracts.refreshData)
                } } } }
            }
        },
        axisPolicy: {
            get: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.axis.policy.view',
                apiExposure: 'serviceRegistry',
                key: '/axis/policy',
                method: 'GET',
                controller: 'DefaultBackofficeAxisPolicyController',
                operation: 'get',
                responses: { '200': { description: 'Effective client-safe Axis employee policy', content: { 'application/json': {
                    schema: successEnvelope(contracts.axisPolicy)
                } } } }
            },
            update: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.axis.policy.update',
                apiExposure: 'serviceRegistry',
                key: '/axis/policy',
                method: 'PUT',
                controller: 'DefaultBackofficeAxisPolicyController',
                operation: 'update',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.axisPolicyUpdate } } },
                responses: { '200': { description: 'Revision-updated persistent Axis employee policy', content: { 'application/json': {
                    schema: successEnvelope(contracts.axisPolicy)
                } } } }
            }
        },
        contractHistory: {
            current: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.view', apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/current', method: 'GET', controller: 'DefaultBackofficeContractController', operation: 'current',
                responses: { '200': { description: 'Current durable safe contract observation', content: { 'application/json': {
                    schema: successEnvelope(contracts.contractCurrentData)
                } } } }
            },
            history: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.view', apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/history', method: 'GET', controller: 'DefaultBackofficeContractController', operation: 'history',
                help: { parameters: [{ name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } }] },
                responses: { '200': { description: 'Bounded durable contract observation history', content: { 'application/json': {
                    schema: successEnvelope(contracts.contractHistoryData)
                } } } }
            },
            compare: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.view', apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/:hash/compare', method: 'POST', controller: 'DefaultBackofficeContractController', operation: 'compare',
                responses: { '200': { description: 'Candidate comparison with the active observation', content: { 'application/json': {
                    schema: successEnvelope(contracts.contractComparisonData)
                } } } }
            },
            approve: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.approve', apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/:hash/approve', method: 'POST', controller: 'DefaultBackofficeContractController', operation: 'approve',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.contractDecision } } },
                responses: { '200': { description: 'Approved contract observation', content: { 'application/json': {
                    schema: successEnvelope(contracts.contractDecisionData)
                } } } }
            },
            reject: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.reject', apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/:hash/reject', method: 'POST', controller: 'DefaultBackofficeContractController', operation: 'reject',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.contractDecision } } },
                responses: { '200': { description: 'Rejected contract observation', content: { 'application/json': {
                    schema: successEnvelope(contracts.contractDecisionData)
                } } } }
            },
            rollback: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.rollback', apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/:hash/rollback', method: 'POST', controller: 'DefaultBackofficeContractController', operation: 'rollback',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.contractDecision } } },
                responses: { '200': { description: 'Rolled-back active contract observation', content: { 'application/json': {
                    schema: successEnvelope(contracts.contractDecisionData)
                } } } }
            }
        }
    }
};
