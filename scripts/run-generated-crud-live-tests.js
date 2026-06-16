const path = require('path');
const { collectGeneratedTests } = require('./run-generated-tests');
const { collectTenantGuardFailures } = require('./live-test-tenant-guard');

const rootPath = path.resolve(__dirname, '..');
const enabled = process.env.NODICS_TEST_ENABLE_DESTRUCTIVE_CRUD === 'true';
const baseUrl = process.env.NODICS_TEST_BASE_URL;
const token = process.env.NODICS_TEST_TOKEN;
const tenant = process.env.NODICS_TEST_TENANT;
const enterprise = process.env.NODICS_TEST_ENTERPRISE;
const contextRoot = process.env.NODICS_TEST_CONTEXT_ROOT || process.env.NODICS_TEST_API_PREFIX || '/nodics';
const selectedModule = getArgValue('--module=');
const selectedSchema = getArgValue('--schema=');
const runId = process.env.NODICS_TEST_RUN_ID || String(Date.now());

validateGuard();

run().then(() => {
    console.log('\nGenerated live CRUD tests passed');
}).catch(error => {
    console.error('\nGenerated live CRUD tests failed');
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
});

async function run() {
    let testPaths = collectGeneratedTests(rootPath, [], {
        selectedType: 'crud',
        includeDestructive: true
    });

    testPaths = testPaths.filter(testPath => {
        let spec = require(testPath);
        return (!selectedModule || spec.moduleName === selectedModule) &&
            (!selectedSchema || spec.schemaName === selectedSchema);
    });

    if (testPaths.length === 0) {
        throw new Error('No generated CRUD tests found. Run npm run build first.');
    }

    for (const testPath of testPaths.sort()) {
        let spec = require(testPath);
        await runSpec(spec, testPath);
    }
}

async function runSpec(spec, testPath) {
    console.log(`\nRunning live CRUD lifecycle for ${spec.moduleName}.${spec.schemaName}`);
    let state = {};
    for (const step of spec.lifecycle || []) {
        await runStep(spec, step, state, testPath);
    }
}

async function runStep(spec, step, state, testPath) {
    let request = replacePlaceholders(step.request, state);
    if (step.optional && hasUnresolvedValue(request)) {
        console.log(`Skipping optional ${step.name} for ${spec.moduleName}.${spec.schemaName}: unresolved runtime value`);
        return;
    }

    let url = createUrl(spec, step.route, request.params || {});
    let response = await executeRequest(step.route.method, url, request);
    let body = await parseBody(response);

    if (step.optional && isMissing(response, body)) {
        console.log(`Optional ${step.name} found no prior record for ${spec.moduleName}.${spec.schemaName}`);
        return;
    }

    if (step.optional && step.expectMissing && response.ok) {
        console.log(`Optional ${step.name} removed prior record for ${spec.moduleName}.${spec.schemaName}`);
        return;
    }

    if (step.expectMissing) {
        if (!isMissing(response, body)) {
            throw createStepError(spec, step, testPath, response, body, 'Expected record to be missing');
        }
        console.log(`Verified deleted ${spec.moduleName}.${spec.schemaName}`);
        return;
    }

    if (!response.ok) {
        throw createStepError(spec, step, testPath, response, body, 'Unexpected HTTP failure');
    }

    let modelId = findFirstValue(body, '_id') || findFirstValue(body, 'id');
    if (modelId) {
        state.createdModelId = modelId;
    }
    console.log(`${step.name} ${spec.moduleName}.${spec.schemaName}: ${response.status}`);
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
    if (Array.isArray(body.success)) {
        return body.success.length === 0;
    }
    if (Array.isArray(body.data)) {
        return body.data.length === 0;
    }
    if (Array.isArray(body.result)) {
        return body.result.length === 0;
    }
    if (body.success && Array.isArray(body.success.data)) {
        return body.success.data.length === 0;
    }
    if (body.count === 0) {
        return true;
    }
    return false;
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
        .replaceAll('<runId>', runId)
        .replaceAll('<createdModelId>', state.createdModelId || '<createdModelId>')
        .replaceAll('<timestamp>', new Date().toISOString());
}

function hasUnresolvedValue(value) {
    if (Array.isArray(value)) {
        return value.some(hasUnresolvedValue);
    }
    if (value && typeof value === 'object') {
        return Object.keys(value).some(key => hasUnresolvedValue(value[key]));
    }
    return typeof value === 'string' && value.includes('<') && value.includes('>');
}

function findFirstValue(value, keyName) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    if (Object.prototype.hasOwnProperty.call(value, keyName) && value[keyName]) {
        return value[keyName];
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            let found = findFirstValue(item, keyName);
            if (found) {
                return found;
            }
        }
        return null;
    }
    for (const key of Object.keys(value)) {
        let found = findFirstValue(value[key], keyName);
        if (found) {
            return found;
        }
    }
    return null;
}

function validateGuard() {
    let missing = [];
    if (!enabled) {
        missing.push('NODICS_TEST_ENABLE_DESTRUCTIVE_CRUD=true');
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
        console.error('Live generated CRUD tests are destructive and require explicit test-environment settings.');
        console.error('Missing: ' + missing.join(', '));
        process.exit(1);
    }
}

function createStepError(spec, step, testPath, response, body, message) {
    return new Error(JSON.stringify({
        message: message,
        moduleName: spec.moduleName,
        schemaName: spec.schemaName,
        step: step.name,
        route: step.route,
        testPath: path.relative(rootPath, testPath),
        status: response.status,
        body: body
    }, null, 4));
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
