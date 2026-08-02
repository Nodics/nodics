/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/service/tool/DefaultAiAssistantToolExecutionService
 * @description Executes one bounded read-only Assistant tool through current BackOffice metadata and standard Nodics module transport.
 * @layer service
 * @owner aiAssistant
 * @override Projects may replace projection rules while preserving policy approval, employee authorization, target authorization, and bounded transport.
 */
const catalogueService = require('./defaultAiAssistantToolCatalogueService');

module.exports = {
    /** Validates the model-produced plan without accepting executable coordinates. */
    validatePlan: function (plan) {
        const keys = ['contractVersion', 'toolId', 'ownerModule', 'operationId', 'arguments'];
        if (!plan || plan.contractVersion !== 1 || Object.keys(plan).some(key => !keys.includes(key)) ||
            !['toolId', 'ownerModule', 'operationId'].every(key =>
                typeof plan[key] === 'string' && /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(plan[key]))) {
            throw catalogueService.error('AI_ASSISTANT_TOOL_PLAN_INVALID');
        }
        const args = plan.arguments || {};
        if (!args || typeof args !== 'object' || Array.isArray(args) ||
            Object.keys(args).some(key => !['pathParameters', 'queryParameters'].includes(key))) {
            throw catalogueService.error('AI_ASSISTANT_TOOL_ARGUMENTS_INVALID');
        }
        this.validateParameters(args.pathParameters);
        this.validateParameters(args.queryParameters);
        return args;
    },

    /** Accepts only bounded scalar path and query values. */
    validateParameters: function (parameters) {
        if (parameters === undefined) return;
        if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters) ||
            Object.keys(parameters).length > 32 ||
            Object.keys(parameters).some(key => !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(key) ||
                !['string', 'number', 'boolean'].includes(typeof parameters[key]) ||
                String(parameters[key]).length > 1024)) {
            throw catalogueService.error('AI_ASSISTANT_TOOL_ARGUMENTS_INVALID');
        }
    },

    /** Rechecks local permission evidence before the target module performs final authorization. */
    authorize: function (descriptor, request) {
        const granted = request.authData && request.authData.permissions || [];
        if (descriptor.requiredPermissions.some(permission =>
            !granted.includes('*') && !granted.includes(permission))) {
            throw catalogueService.error('AI_ASSISTANT_TOOL_PERMISSION_DENIED');
        }
    },

    /** Resolves an observed OpenAPI path to standard module transport coordinates. */
    coordinates: function (descriptor, arguments_) {
        const escapedModule = descriptor.ownerModule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const match = String(descriptor.path || '').match(
            new RegExp('^/[^/]+/' + escapedModule + '/(v[0-9]+)(/.*)$')
        );
        if (!match) throw catalogueService.error('AI_ASSISTANT_TOOL_PATH_INVALID');
        let apiName = match[2];
        const pathParameters = arguments_.pathParameters || {};
        const expected = [];
        apiName = apiName.replace(/\{([A-Za-z][A-Za-z0-9_-]{0,63})\}/g, (value, name) => {
            expected.push(name);
            if (!Object.prototype.hasOwnProperty.call(pathParameters, name)) {
                throw catalogueService.error('AI_ASSISTANT_TOOL_PATH_PARAMETER_MISSING');
            }
            return encodeURIComponent(String(pathParameters[name]));
        });
        if (Object.keys(pathParameters).some(name => !expected.includes(name))) {
            throw catalogueService.error('AI_ASSISTANT_TOOL_PATH_PARAMETER_UNKNOWN');
        }
        const query = new URLSearchParams();
        Object.keys(arguments_.queryParameters || {}).sort().forEach(name =>
            query.set(name, String(arguments_.queryParameters[name])));
        if (query.size) apiName += '?' + query.toString();
        return { apiVersion: match[1], apiName: apiName };
    },

    /** Projects the target response into a bounded provider-neutral result. */
    project: function (value, maximumCharacters) {
        let serialized;
        try {
            serialized = JSON.stringify(value === undefined ? null : value);
        } catch (error) {
            throw catalogueService.error('AI_ASSISTANT_TOOL_RESULT_INVALID');
        }
        if (serialized.length > maximumCharacters) {
            throw catalogueService.error('AI_ASSISTANT_TOOL_RESULT_TOO_LARGE');
        }
        return JSON.parse(serialized);
    },

    /** Applies the policy-owned top-level result allowlist before provider exposure. */
    projectFields: function (value, fields) {
        if (!Array.isArray(fields) || fields.length === 0 || fields.length > 64 ||
            fields.some(field => typeof field !== 'string' ||
                !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(field))) {
            throw catalogueService.error('AI_ASSISTANT_TOOL_RESULT_PROJECTION_INVALID');
        }
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw catalogueService.error('AI_ASSISTANT_TOOL_RESULT_INVALID');
        }
        return fields.reduce((result, field) => {
            if (Object.prototype.hasOwnProperty.call(value, field)) result[field] = value[field];
            return result;
        }, {});
    },

    /** Executes one approved read-only operation and relies on the target route for final authorization and validation. */
    execute: async function (plan, policy, request, runtime) {
        const configuration = runtime.configuration.tools;
        if (configuration.enabled !== true || configuration.defaultMode !== 'DENY' ||
            !policy || policy.enabled !== true || policy.contractVersion !== 1) {
            throw catalogueService.error('AI_ASSISTANT_TOOLS_DISABLED');
        }
        const arguments_ = this.validatePlan(plan);
        const operation = await catalogueService.resolve(plan, policy, request, runtime);
        this.authorize(operation, request);
        if (!request.authToken) throw catalogueService.error('AI_ASSISTANT_EMPLOYEE_CREDENTIAL_UNAVAILABLE');
        const coordinates = this.coordinates(operation, arguments_);
        const descriptor = SERVICE.DefaultModuleService.buildRequest({
            moduleName: operation.ownerModule,
            apiVersion: coordinates.apiVersion,
            apiName: coordinates.apiName,
            methodName: operation.method,
            header: {
                Authorization: request.authToken,
                'x-enterprise-code': request.authData && request.authData.entCode
            },
            timeoutMs: configuration.requestTimeoutMs,
            maxAttempts: 1,
            maxResponseBytes: configuration.maximumResultBytes,
            followRedirects: false
        });
        const response = await SERVICE.DefaultModuleService.fetch(descriptor);
        const result = response && response.data && (response.data.data || response.data);
        const projected = this.projectFields(result, operation.resultFields);
        return {
            contractVersion: 1,
            toolId: operation.toolId,
            ownerModule: operation.ownerModule,
            operationId: operation.operationId,
            result: this.project(projected, configuration.maximumResultCharacters)
        };
    },

    /** Executes a plan while persisting only bounded non-sensitive lifecycle evidence. */
    executeAndRecord: async function (plan, policy, turn, request, runtime, context) {
        const publisher = runtime.toolEventPublisher;
        if (typeof publisher !== 'function') {
            throw catalogueService.error('AI_ASSISTANT_TOOL_EVENT_PUBLISHER_UNAVAILABLE');
        }
        const identity = {
            toolId: plan.toolId,
            ownerModule: plan.ownerModule,
            operationId: plan.operationId
        };
        await publisher(turn, 'TOOL_PLAN', identity, request, context);
        await publisher(turn, 'TOOL_STARTED', identity, request, context);
        try {
            const output = await this.execute(plan, policy, request, runtime);
            const serialized = JSON.stringify(output.result);
            await publisher(turn, 'TOOL_RESULT', Object.assign({}, identity, {
                outcome: 'SUCCEEDED',
                resultCharacters: serialized.length,
                resultKeys: output.result && typeof output.result === 'object' &&
                    !Array.isArray(output.result) ? Object.keys(output.result).slice(0, 32).sort() : []
            }), request, context);
            return output;
        } catch (error) {
            await publisher(turn, 'TOOL_RESULT', Object.assign({}, identity, {
                outcome: 'FAILED',
                code: typeof error.code === 'string' && error.code.length <= 128 ?
                    error.code : 'AI_ASSISTANT_TOOL_EXECUTION_FAILED'
            }), request, context);
            throw error;
        }
    }
};
