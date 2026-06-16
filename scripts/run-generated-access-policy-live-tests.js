const path = require('path');
const { collectGeneratedTests } = require('./run-generated-tests');
const { collectTenantGuardFailures } = require('./live-test-tenant-guard');

const rootPath = path.resolve(__dirname, '..');
const enabled = process.env.NODICS_TEST_ENABLE_ACCESS_POLICY_LIVE === 'true';
const allowAll = process.env.NODICS_TEST_ACCESS_POLICY_ALL === 'true';
const baseUrl = process.env.NODICS_TEST_BASE_URL;
const token = process.env.NODICS_TEST_TOKEN;
const tenant = process.env.NODICS_TEST_TENANT;
const enterprise = process.env.NODICS_TEST_ENTERPRISE;
const contextRoot = process.env.NODICS_TEST_CONTEXT_ROOT || process.env.NODICS_TEST_API_PREFIX || '/nodics';
const restrictedUserGroup = process.env.NODICS_TEST_RESTRICTED_USER_GROUP || 'userGroup';
const selectedModule = getArgValue('--module=');
const selectedSchema = getArgValue('--schema=');
const dryRunContract = process.argv.includes('--dry-run-contract');
const runId = process.env.NODICS_TEST_RUN_ID || String(Date.now());

validateGuard();

run().then(() => {
    let mode = dryRunContract ? 'contract' : 'live';
    console.log(`\nGenerated access policy ${mode} tests passed`);
}).catch(error => {
    console.error('\nGenerated access policy tests failed');
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
});

async function run() {
    let specs = collectSpecs();
    let policySpec = specs.find(spec => spec.moduleName === 'dynamo' && spec.schemaName === 'schemaAccessPolicy');
    if (!policySpec) {
        throw new Error('schemaAccessPolicy generated CRUD spec not found. Run npm run build first.');
    }

    specs = specs.filter(spec => {
        return spec.accessPolicyScenarios &&
            spec.accessPolicyScenarios.length > 0 &&
            (!selectedModule || spec.moduleName === selectedModule) &&
            (!selectedSchema || spec.schemaName === selectedSchema);
    });

    if (specs.length === 0) {
        throw new Error('No generated access policy specs found for the selected target. Run npm run build first.');
    }

    for (const spec of specs.sort(compareSpecs)) {
        validateSpecContract(spec);
        if (!dryRunContract) {
            await runLiveSpec(spec, policySpec);
        }
    }
}

function collectSpecs() {
    return collectGeneratedTests(rootPath, [], {
        selectedType: 'crud',
        includeDestructive: true
    }).map(testPath => requireGeneratedSpec(testPath));
}

function requireGeneratedSpec(testPath) {
    if (process.env.NODICS_TEST_VERBOSE_GENERATED_LOAD === 'true') {
        return require(testPath);
    }
    let originalLog = console.log;
    console.log = function () {};
    try {
        return require(testPath);
    } finally {
        console.log = originalLog;
    }
}

function validateSpecContract(spec) {
    let actions = (spec.accessPolicyScenarios || []).map(scenario => scenario.policyAction).sort();
    ['create', 'delete', 'read', 'update'].forEach(action => {
        if (!actions.includes(action)) {
            throw new Error(`Generated access policy scenario missing ${action} for ${spec.moduleName}.${spec.schemaName}`);
        }
    });
    let deleteScenario = spec.accessPolicyScenarios.find(scenario => scenario.policyAction === 'delete');
    if (!deleteScenario || deleteScenario.policy.propertyName !== '*') {
        throw new Error(`Generated delete access policy must be schema-level for ${spec.moduleName}.${spec.schemaName}`);
    }
}

async function runLiveSpec(spec, policySpec) {
    console.log(`\nRunning live access policy scenarios for ${spec.moduleName}.${spec.schemaName}`);
    let state = {};
    await cleanupPolicies(spec, policySpec);
    await runOptionalLifecycleStep(spec, 'cleanupBefore', state);
    await runRequiredLifecycleStep(spec, 'create', state);

    try {
        for (const scenario of spec.accessPolicyScenarios) {
            await runAccessPolicyScenario(spec, policySpec, scenario, state);
        }
    } finally {
        await cleanupPolicies(spec, policySpec);
        await runOptionalLifecycleStep(spec, 'delete', state);
    }
}

async function runAccessPolicyScenario(spec, policySpec, scenario, state) {
    let policyCode = createPolicyCode(spec, scenario);
    await savePolicy(policySpec, spec, scenario, policyCode);
    try {
        let request = replacePlaceholders(scenario.request, state);
        let url = createUrl(spec, scenario.route, request.params || {});
        let response = await executeRequest(scenario.route.method, url, request);
        let body = await parseBody(response);
        assertScenarioOutcome(spec, scenario, state, response, body);
        console.log(`${scenario.name} ${spec.moduleName}.${spec.schemaName}: ${response.status}`);
    } finally {
        await removePolicy(policySpec, policyCode);
    }
}

async function savePolicy(policySpec, spec, scenario, policyCode) {
    let route = findScenario(policySpec.scenarios, 'save').route;
    let policy = {
        code: policyCode,
        active: true,
        moduleName: spec.moduleName,
        schemaName: spec.schemaName,
        propertyName: scenario.policy.propertyName,
        userGroups: [restrictedUserGroup],
        actions: [scenario.policyAction],
        effect: scenario.expected.effect,
        priority: 1,
        appliesToTenants: [tenant],
        maskStrategy: scenario.policyAction === 'read' && scenario.expected.effect === 'MASK' ? 'empty' : undefined,
        status: 'ACTIVE',
        reason: 'Generated live access policy test ' + runId
    };
    let response = await executeRequest(route.method, createUrl(policySpec, route, {}), {
        headers: createHeaders(),
        body: policy
    });
    let body = await parseBody(response);
    if (!response.ok) {
        throw createHttpError(policySpec, { name: 'saveAccessPolicy', route }, response, body, 'Unable to create schema access policy');
    }
}

async function removePolicy(policySpec, policyCode) {
    let scenario = findScenario(policySpec.scenarios, 'removeByCode') || findScenario(policySpec.scenarios, 'remove');
    let request = {
        headers: createHeaders(),
        params: scenario.route.key.includes(':code') ? { code: policyCode } : {},
        body: scenario.route.key.includes(':code') ? {} : {
            options: {
                returnModified: true
            },
            query: {
                code: policyCode
            }
        }
    };
    let response = await executeRequest(scenario.route.method, createUrl(policySpec, scenario.route, request.params), request);
    let body = await parseBody(response);
    if (!response.ok && !isMissing(response, body)) {
        throw createHttpError(policySpec, scenario, response, body, 'Unable to remove schema access policy');
    }
}

async function cleanupPolicies(spec, policySpec) {
    for (const scenario of spec.accessPolicyScenarios || []) {
        await removePolicy(policySpec, createPolicyCode(spec, scenario));
    }
}

async function runRequiredLifecycleStep(spec, stepName, state) {
    let step = findLifecycleStep(spec, stepName);
    if (!step) {
        throw new Error(`Missing lifecycle step ${stepName} for ${spec.moduleName}.${spec.schemaName}`);
    }
    let response = await executeLifecycleStep(spec, step, state);
    if (!response.response.ok) {
        throw createHttpError(spec, step, response.response, response.body, `Lifecycle step ${stepName} failed`);
    }
    let modelId = findFirstValue(response.body, '_id') || findFirstValue(response.body, 'id');
    if (modelId) {
        state.createdModelId = modelId;
    }
    state.createdModel = replacePlaceholders(step.request.body || {}, state);
}

async function runOptionalLifecycleStep(spec, stepName, state) {
    let step = findLifecycleStep(spec, stepName);
    if (!step) {
        return;
    }
    let response = await executeLifecycleStep(spec, step, state);
    if (!response.response.ok && !isMissing(response.response, response.body)) {
        throw createHttpError(spec, step, response.response, response.body, `Optional lifecycle step ${stepName} failed`);
    }
}

async function executeLifecycleStep(spec, step, state) {
    let request = replacePlaceholders(step.request, state);
    let url = createUrl(spec, step.route, request.params || {});
    let response = await executeRequest(step.route.method, url, request);
    let body = await parseBody(response);
    return {
        response: response,
        body: body
    };
}

function assertScenarioOutcome(spec, scenario, state, response, body) {
    if (scenario.expected.blocked) {
        if (!isErrorResponse(response, body)) {
            throw createHttpError(spec, scenario, response, body, 'Expected access policy to block request');
        }
        let code = body && body.code;
        if (code && code !== 'ERR_AUTH_00003') {
            throw createHttpError(spec, scenario, response, body, 'Expected access policy authorization error');
        }
        return;
    }

    if (!response.ok) {
        throw createHttpError(spec, scenario, response, body, 'Expected access policy request to succeed');
    }
    if (scenario.expected.responseFiltering) {
        assertResponseFiltered(spec, scenario, state, response, body);
    }
}

function assertResponseFiltered(spec, scenario, state, response, body) {
    let propertyName = scenario.policy.propertyName;
    let original = state.createdModel ? state.createdModel[propertyName] : undefined;
    let filtered = findFirstValue(body, propertyName);
    if (original === undefined) {
        return;
    }
    if (filtered === original) {
        throw createHttpError(spec, scenario, response, body, `Expected ${propertyName} to be filtered`);
    }
}

async function executeRequest(method, url, request) {
    let headers = Object.assign({}, request.headers || {}, {
        Accept: 'application/json'
    });
    let options = {
        method: method.toUpperCase(),
        headers: headers
    };
    if (method !== 'get' && request.body !== undefined) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(request.body);
    }
    return fetch(url, options);
}

function createUrl(spec, route, params) {
    let routeKey = route.key;
    let apiVersion = route.apiVersion || 'v0';
    let urlPrefix = spec.urlPrefix || spec.moduleName;
    let resolvedRoute = String(routeKey).split('/').map(part => {
        if (part.startsWith(':')) {
            let paramName = part.substring(1);
            return encodeURIComponent(params[paramName]);
        }
        return part;
    }).join('/');
    return trimRight(baseUrl, '/') + trimRight(contextRoot, '/') + '/' + urlPrefix + '/' + apiVersion + resolvedRoute;
}

async function parseBody(response) {
    let text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
}

function createHeaders() {
    return {
        Authorization: 'Bearer ' + token,
        tenant: tenant,
        'x-enterprise-code': enterprise
    };
}

function replacePlaceholders(value, state) {
    if (Array.isArray(value)) {
        return value.map(item => replacePlaceholders(item, state));
    }
    if (value && typeof value === 'object') {
        let copy = {};
        Object.keys(value).forEach(key => {
            copy[key] = replacePlaceholders(value[key], state);
        });
        return copy;
    }
    if (typeof value !== 'string') {
        return value;
    }
    return value
        .replaceAll('<token>', token)
        .replaceAll('<testTenant>', tenant)
        .replaceAll('<enterpriseCode>', enterprise)
        .replaceAll('<restrictedUserGroup>', restrictedUserGroup)
        .replaceAll('<runId>', runId)
        .replaceAll('<createdModelId>', state.createdModelId || '<createdModelId>')
        .replaceAll('<timestamp>', new Date().toISOString());
}

function findScenario(scenarios, operation) {
    return (scenarios || []).find(scenario => scenario.operation === operation || scenario.name === operation);
}

function findLifecycleStep(spec, name) {
    return (spec.lifecycle || []).find(step => step.name === name);
}

function createPolicyCode(spec, scenario) {
    return [
        'ntest',
        'accesspolicy',
        spec.moduleName,
        spec.schemaName,
        scenario.policyAction,
        runId
    ].join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function isMissing(response, body) {
    if (response.status === 404) {
        return true;
    }
    if (!response.ok) {
        return false;
    }
    if (body === null || body === undefined) {
        return true;
    }
    if (Array.isArray(body)) {
        return body.length === 0;
    }
    if (Array.isArray(body.result)) {
        return body.result.length === 0;
    }
    if (body.result && Array.isArray(body.result.models)) {
        return body.result.models.length === 0;
    }
    if (body.count === 0) {
        return true;
    }
    return false;
}

function isErrorResponse(response, body) {
    return !response.ok ||
        (body && body.success === false) ||
        (body && typeof body.code === 'string' && body.code.startsWith('ERR_')) ||
        (body && Array.isArray(body.errors) && body.errors.length > 0);
}

function findFirstValue(value, keyName) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    if (Object.prototype.hasOwnProperty.call(value, keyName)) {
        return value[keyName];
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            let found = findFirstValue(item, keyName);
            if (found !== null && found !== undefined) {
                return found;
            }
        }
        return null;
    }
    for (const key of Object.keys(value)) {
        let found = findFirstValue(value[key], keyName);
        if (found !== null && found !== undefined) {
            return found;
        }
    }
    return null;
}

function validateGuard() {
    if (dryRunContract) {
        return;
    }
    let missing = [];
    if (!enabled) {
        missing.push('NODICS_TEST_ENABLE_ACCESS_POLICY_LIVE=true');
    }
    if (!selectedModule || !selectedSchema) {
        if (!allowAll) {
            missing.push('--module=<moduleName> and --schema=<schemaName> or NODICS_TEST_ACCESS_POLICY_ALL=true');
        }
    }
    if (!baseUrl) {
        missing.push('NODICS_TEST_BASE_URL');
    }
    if (!token) {
        missing.push('NODICS_TEST_TOKEN');
    }
    collectTenantGuardFailures({
        tenant: tenant,
        env: process.env
    }).forEach(failure => missing.push(failure));
    if (!enterprise) {
        missing.push('NODICS_TEST_ENTERPRISE');
    }
    if (missing.length > 0) {
        console.error('Live generated access policy tests mutate test-tenant data and require explicit settings.');
        console.error('Missing: ' + missing.join(', '));
        process.exit(1);
    }
}

function createHttpError(spec, step, response, body, message) {
    return new Error(JSON.stringify({
        message: message,
        moduleName: spec.moduleName,
        schemaName: spec.schemaName,
        step: step.name,
        route: step.route,
        status: response.status,
        body: body
    }, null, 4));
}

function compareSpecs(left, right) {
    return `${left.moduleName}.${left.schemaName}`.localeCompare(`${right.moduleName}.${right.schemaName}`);
}

function getArgValue(prefix) {
    let arg = process.argv.find(item => item.startsWith(prefix));
    return arg ? arg.substring(prefix.length) : null;
}

function trimRight(value, char) {
    let output = String(value || '');
    while (output.endsWith(char)) {
        output = output.substring(0, output.length - 1);
    }
    return output;
}
