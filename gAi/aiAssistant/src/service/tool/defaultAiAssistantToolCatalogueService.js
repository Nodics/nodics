/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/service/tool/DefaultAiAssistantToolCatalogueService
 * @description Resolves approved Assistant tool identities against the current employee-filtered BackOffice contract catalogue.
 * @layer service
 * @owner aiAssistant
 * @override Projects may replace catalogue transport while preserving BackOffice contract authority and fail-closed identity matching.
 */
module.exports = {
    /** Loads the current BackOffice bootstrap through the authenticated employee boundary. */
    load: async function (request, runtime) {
        if (runtime && typeof runtime.backofficeCatalogueProvider === 'function') {
            return runtime.backofficeCatalogueProvider(request);
        }
        if (!request.authToken) throw this.error('AI_ASSISTANT_EMPLOYEE_CREDENTIAL_UNAVAILABLE');
        const configuration = runtime.configuration.tools;
        const descriptor = SERVICE.DefaultModuleService.buildRequest({
            moduleName: configuration.catalogueModule || 'backoffice',
            apiVersion: configuration.catalogueApiVersion || 'v0',
            apiName: configuration.catalogueApiName || '/bootstrap',
            methodName: 'GET',
            header: {
                Authorization: request.authToken,
                'x-enterprise-code': request.authData && request.authData.entCode
            },
            timeoutMs: configuration.requestTimeoutMs,
            maxAttempts: 1,
            maxResponseBytes: configuration.maximumCatalogueBytes,
            followRedirects: false
        });
        const response = await SERVICE.DefaultModuleService.fetch(descriptor);
        return response && response.data && (response.data.data || response.data);
    },

    /** Resolves one policy-approved operation from the current observed target contract. */
    resolve: async function (plan, policy, request, runtime) {
        const approved = (policy.approvedOperations || []).find(item =>
            item && item.toolId === plan.toolId &&
            item.ownerModule === plan.ownerModule &&
            item.operationId === plan.operationId);
        if (!approved) throw this.error('AI_ASSISTANT_TOOL_NOT_APPROVED');
        const bootstrap = await this.load(request, runtime);
        const moduleContract = bootstrap && bootstrap.catalogue &&
            bootstrap.catalogue[approved.ownerModule] &&
            bootstrap.catalogue[approved.ownerModule].contract;
        const operation = moduleContract && (moduleContract.operations || []).find(item =>
            item.operationId === approved.operationId);
        if (!operation) throw this.error('AI_ASSISTANT_TOOL_OPERATION_UNAVAILABLE');
        if (!['GET', 'HEAD', 'OPTIONS'].includes(String(operation.method).toUpperCase()) ||
            approved.mode !== 'READ') {
            throw this.error('AI_ASSISTANT_READ_ONLY_TOOL_REQUIRED');
        }
        const currentPermissions = [].concat(operation.permissions || []);
        const approvedPermissions = [].concat(approved.requiredPermissions || []);
        if (approvedPermissions.some(permission => !currentPermissions.includes(permission))) {
            throw this.error('AI_ASSISTANT_TOOL_CONTRACT_PERMISSION_DRIFT');
        }
        return {
            toolId: approved.toolId,
            ownerModule: approved.ownerModule,
            operationId: approved.operationId,
            mode: approved.mode,
            requiredPermissions: Array.from(new Set(
                currentPermissions.concat(approvedPermissions)
            )),
            resultFields: Array.isArray(approved.resultFields) ?
                approved.resultFields.slice() : [],
            method: String(operation.method).toUpperCase(),
            path: operation.path
        };
    },

    /** Resolves one policy-approved mutation without disclosing executable coordinates to the provider. */
    resolveMutation: async function (plan, policy, request, runtime) {
        const approved = (policy.approvedOperations || []).find(item =>
            item && item.toolId === plan.toolId &&
            item.ownerModule === plan.ownerModule &&
            item.operationId === plan.operationId);
        if (!approved || approved.mode !== 'MUTATION' ||
            approved.confirmationRequired !== true) {
            throw this.error('AI_ASSISTANT_TOOL_NOT_APPROVED');
        }
        const bootstrap = await this.load(request, runtime);
        const moduleContract = bootstrap && bootstrap.catalogue &&
            bootstrap.catalogue[approved.ownerModule] &&
            bootstrap.catalogue[approved.ownerModule].contract;
        const operation = moduleContract && (moduleContract.operations || []).find(item =>
            item.operationId === approved.operationId);
        if (!operation || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(
            String(operation.method).toUpperCase())) {
            throw this.error('AI_ASSISTANT_TOOL_OPERATION_UNAVAILABLE');
        }
        const currentPermissions = [].concat(operation.permissions || []);
        const approvedPermissions = [].concat(approved.requiredPermissions || []);
        if (approvedPermissions.some(permission => !currentPermissions.includes(permission))) {
            throw this.error('AI_ASSISTANT_TOOL_CONTRACT_PERMISSION_DRIFT');
        }
        const requiredPermissions = Array.from(new Set(
            currentPermissions.concat(approvedPermissions)
        ));
        const granted = request.authData && request.authData.permissions || [];
        if (requiredPermissions.some(permission =>
            !granted.includes('*') && !granted.includes(permission))) {
            throw this.error('AI_ASSISTANT_TOOL_NOT_AUTHORIZED');
        }
        return {
            toolId: approved.toolId,
            ownerModule: approved.ownerModule,
            operationId: approved.operationId,
            mode: approved.mode,
            confirmationRequired: true,
            requiredPermissions: requiredPermissions,
            inputSchema: approved.inputSchema
        };
    },

    /** Projects currently available approved read operations without executable coordinates. */
    list: async function (policy, request, runtime) {
        if (!policy || policy.enabled !== true || policy.contractVersion !== 1) return [];
        const bootstrap = await this.load(request, runtime);
        const granted = request.authData && request.authData.permissions || [];
        return (policy.approvedOperations || []).reduce((result, approved) => {
            const contract = bootstrap && bootstrap.catalogue &&
                bootstrap.catalogue[approved.ownerModule] &&
                bootstrap.catalogue[approved.ownerModule].contract;
            const operation = contract && (contract.operations || []).find(item =>
                item.operationId === approved.operationId);
            const method = operation && String(operation.method).toUpperCase();
            const read = approved.mode === 'READ' &&
                ['GET', 'HEAD', 'OPTIONS'].includes(method);
            const mutation = approved.mode === 'MUTATION' &&
                approved.confirmationRequired === true &&
                ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
            if (!operation || (!read && !mutation)) return result;
            const requiredPermissions = Array.from(new Set(
                [].concat(operation.permissions || [], approved.requiredPermissions || [])
            ));
            if (requiredPermissions.some(permission =>
                !granted.includes('*') && !granted.includes(permission))) return result;
            const pathParameters = Array.from(String(operation.path || '')
                .matchAll(/\{([A-Za-z][A-Za-z0-9_-]{0,63})\}/g)).map(match => match[1]);
            result.push({
                contractVersion: 1,
                toolId: approved.toolId,
                ownerModule: approved.ownerModule,
                operationId: approved.operationId,
                mode: approved.mode,
                confirmationRequired: mutation,
                description: typeof approved.description === 'string' ?
                    approved.description.slice(0, 512) : approved.toolId,
                requiredPathParameters: pathParameters,
                inputSchema: approved.inputSchema && typeof approved.inputSchema === 'object' ?
                    approved.inputSchema : {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            pathParameters: { type: 'object' },
                            queryParameters: { type: 'object' }
                        }
                    }
            });
            return result;
        }, []).slice(0, runtime.configuration.tools.maximumCallsPerTurn);
    },

    /** Creates a stable non-sensitive tool governance error. */
    error: function (code) {
        const error = new Error(code);
        error.code = code;
        return error;
    }
};
