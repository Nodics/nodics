/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');
const _ = require('lodash');

/**
 * @module startio/envs/startioLocal/test/topology/startioLocalRuntimeTopology
 * @description Starts the configured consolidated and modular startioLocal servers and proves runtime readiness, metadata-driven module activation, tenant and internal-auth initialization, mandatory profile data, route availability, and cross-process communication.
 * @layer test
 * @owner startioLocal
 * @override Environment modules define their topology and communication checks through layered `test.runtimeTopology` configuration.
 */

const ROOT = path.resolve(__dirname, '../../../../..');
const LOCAL_ENV = path.join(ROOT, 'startio/envs/startioLocal');
const environmentProperties = require(path.join(LOCAL_ENV, 'config/properties.js'));
const STARTUP_TIMEOUT_MS = Number(process.env.NODICS_TOPOLOGY_TIMEOUT_MS || 60000);
const CONTRACT_TIMEOUT_MS = Number(process.env.NODICS_TOPOLOGY_CONTRACT_TIMEOUT_MS || STARTUP_TIMEOUT_MS);
const SHUTDOWN_TIMEOUT_MS = 5000;
const REGISTRY_TIMEOUT_MS = Number(process.env.NODICS_TOPOLOGY_REGISTRY_TIMEOUT_MS || 30000);
const TOPOLOGY_MODE = getTopologyMode();
const TOPOLOGY_CONFIG = _.get(environmentProperties, 'test.runtimeTopology', {});
const CONSOLIDATED_SERVER = TOPOLOGY_CONFIG.monoServer;
const SERVER_ORDER = TOPOLOGY_CONFIG.modularServers || [];
const REQUIRED_CONSOLIDATED_MODULES = TOPOLOGY_CONFIG.requiredConsolidatedModules || [];
const REQUIRED_MODULAR_MODULES = TOPOLOGY_CONFIG.requiredModularModules || {};
const COMMUNICATION_CHECKS = TOPOLOGY_CONFIG.communicationChecks || [];

assert(CONSOLIDATED_SERVER, 'test.runtimeTopology.monoServer is required');
assert(SERVER_ORDER.length > 0, 'test.runtimeTopology.modularServers must define at least one server');

function loadProperties(serverName) {
    return require(path.join(LOCAL_ENV, serverName, 'config/properties.js'));
}

function getDefaultNodeId(serverName) {
    let props = loadProperties(serverName);
    let nodes = props.servers && props.servers.default && props.servers.default.nodes;
    assert(nodes && Object.keys(nodes).length > 0, 'servers.default.nodes must define at least one node for ' + serverName);
    return Object.keys(nodes)[0];
}

function getNodeId(serverName, nodeName) {
    if (!nodeName) {
        return getDefaultNodeId(serverName);
    }
    let nodePropertiesPath = path.join(LOCAL_ENV, serverName, nodeName, 'config/properties.js');
    if (fs.existsSync(nodePropertiesPath)) {
        return require(nodePropertiesPath).nodeId || getDefaultNodeId(serverName);
    }
    return getDefaultNodeId(serverName);
}

function getServerNodePort(serverName, nodeName) {
    let props = loadProperties(serverName);
    let nodeId = getNodeId(serverName, nodeName);
    assert(props.servers && props.servers.default && props.servers.default.nodes, 'servers.default.nodes is required for ' + serverName);
    assert(props.servers.default.nodes[nodeId], serverName + ' does not define node: ' + nodeId);
    return props.servers.default.nodes[nodeId].httpPort;
}

function waitForPort(port, timeoutMs) {
    let startedAt = Date.now();
    return new Promise((resolve, reject) => {
        function tryConnect() {
            let socket = net.createConnection({ host: '127.0.0.1', port: port });
            socket.once('connect', () => {
                socket.destroy();
                resolve(true);
            });
            socket.once('error', error => {
                socket.destroy();
                if (Date.now() - startedAt >= timeoutMs) {
                    reject(error);
                } else {
                    setTimeout(tryConnect, 250);
                }
            });
        }
        tryConnect();
    });
}

function requestModuleEndpoint(options) {
    let port = getServerNodePort(options.server, options.node);
    let modulePath = options.path || '/ping?help';
    let requestPath = '/nodics/' + options.moduleName + modulePath;
    let requestOptions = {
        host: '127.0.0.1',
        port: port,
        path: requestPath,
        method: options.method || 'GET',
        headers: options.headers || {}
    };
    return new Promise((resolve, reject) => {
        let request = http.request(requestOptions, response => {
            let body = '';
            response.on('data', chunk => {
                body += chunk.toString();
            });
            response.on('end', () => {
                let expectedStatus = options.expectedStatus || 200;
                let expectedStatuses = options.expectedStatuses || [expectedStatus];
                if (expectedStatuses.includes(response.statusCode)) {
                    resolve({
                        statusCode: response.statusCode,
                        body: body,
                        url: 'http://127.0.0.1:' + port + requestPath
                    });
                } else {
                    reject(new Error('Unexpected status ' + response.statusCode + ' from ' + requestPath +
                        '; expected ' + expectedStatuses.join(' or ') + ': ' + body));
                }
            });
        });
        request.on('error', reject);
        request.end(options.body === undefined ? undefined : JSON.stringify(options.body));
    });
}

function parseJsonResponse(response, label) {
    try {
        return JSON.parse(response.body);
    } catch (error) {
        throw new Error(label + ' returned invalid JSON: ' + response.body);
    }
}

function findAuthToken(payload) {
    if (!payload || typeof payload !== 'object') return undefined;
    if (typeof payload.authToken === 'string') return payload.authToken;
    return findAuthToken(payload.result) || findAuthToken(payload.data);
}

function findTenant(payload) {
    if (!payload || typeof payload !== 'object') return undefined;
    if (typeof payload.tenant === 'string') return payload.tenant;
    return findTenant(payload.result) || findTenant(payload.data);
}

async function runBackofficeHumanAuthenticationSmoke(profileServer = CONSOLIDATED_SERVER,
    backofficeServer = CONSOLIDATED_SERVER) {
    let headers = { 'content-type': 'application/json', 'x-enterprise-code': 'default' };
    let login = await requestModuleEndpoint({
        server: profileServer,
        moduleName: 'profile',
        path: '/v0/employee/authenticate',
        method: 'POST',
        expectedStatuses: process.env.NODICS_TOPOLOGY_ADMIN_PASSWORD ? [200] : [200, 401],
        headers: headers,
        body: {
            loginId: 'admin',
            password: process.env.NODICS_TOPOLOGY_ADMIN_PASSWORD || environmentProperties.bootstrapIdentity.adminPassword
        }
    });
    if (login.statusCode === 401) {
        return {
            status: 'SKIPPED_LEGACY_LOCAL_CREDENTIAL',
            reason: 'Set NODICS_TOPOLOGY_ADMIN_PASSWORD to execute the persisted local human-auth journey'
        };
    }
    let accessToken = findAuthToken(parseJsonResponse(login, 'Profile employee authentication'));
    assert(accessToken, 'Profile employee authentication must return a human access token');
    let rejectedLogin = await requestModuleEndpoint({
        server: profileServer,
        moduleName: 'profile',
        path: '/v0/employee/authenticate',
        method: 'POST',
        expectedStatus: 401,
        headers: headers,
        body: { loginId: 'admin', password: 'invalid-local-password' }
    });
    let bearerHeaders = { Authorization: 'Bearer ' + accessToken, 'x-enterprise-code': 'default' };
    let authorization = await requestModuleEndpoint({
        server: profileServer,
        moduleName: 'profile',
        path: '/v0/token/authorize',
        method: 'POST',
        headers: Object.assign({ 'content-type': 'application/json' }, bearerHeaders),
        body: {}
    });
    assert.strictEqual(findTenant(parseJsonResponse(authorization, 'Profile token authorization')), 'default',
        'Profile must preserve the authenticated tenant in the human Bearer token');
    let missingToken = await requestModuleEndpoint({
        server: backofficeServer,
        moduleName: 'backoffice',
        path: '/v0/registry/modules',
        expectedStatus: 401
    });
    let registry = await requestModuleEndpoint({
        server: backofficeServer,
        moduleName: 'backoffice',
        path: '/v0/registry/modules',
        headers: bearerHeaders
    });
    let bootstrap = await requestModuleEndpoint({
        server: backofficeServer,
        moduleName: 'backoffice',
        path: '/v0/bootstrap',
        headers: bearerHeaders
    });
    let insufficientPermission = await requestModuleEndpoint({
        server: backofficeServer,
        moduleName: 'backoffice',
        path: '/v0/registry/admin/modules',
        expectedStatus: 403,
        headers: bearerHeaders
    });
    let serviceTokenResponse = await requestModuleEndpoint({
        server: profileServer,
        moduleName: 'profile',
        path: '/v0/auth/token/default',
        headers: {
            'x-api-key': environmentProperties.bootstrapIdentity.serviceApiKey,
            'x-enterprise-code': 'default',
            'x-nodics-runtime-instance': 'topology-auth-boundary',
            'x-nodics-modules': 'backoffice'
        }
    });
    let serviceToken = findAuthToken(parseJsonResponse(serviceTokenResponse, 'Profile internal authentication'));
    assert(serviceToken, 'Profile internal authentication must return a service token');
    let serviceTokenRejected = await requestModuleEndpoint({
        server: backofficeServer,
        moduleName: 'backoffice',
        path: '/v0/registry/admin/modules',
        expectedStatus: 403,
        headers: { Authorization: 'Bearer ' + serviceToken, 'x-enterprise-code': 'default' }
    });
    return {
        profileServer: profileServer,
        backofficeServer: backofficeServer,
        rejectedPassword: rejectedLogin.statusCode,
        missingToken: missingToken.statusCode,
        authorizedRegistry: registry.statusCode,
        authorizedBootstrap: bootstrap.statusCode,
        tenantPreserved: true,
        insufficientPermission: insufficientPermission.statusCode,
        serviceTokenRejected: serviceTokenRejected.statusCode
    };
}

function requestRegisteredEndpoint(instance, path = '/v0/ping?help') {
    assert(instance && instance.endpoint, 'A registered client-callable endpoint is required');
    let target = new URL(instance.endpoint.replace(/\/$/, '') + path);
    return new Promise((resolve, reject) => {
        let request = http.request({ hostname: target.hostname, port: target.port, path: target.pathname + target.search, method: 'GET' }, response => {
            let body = '';
            response.on('data', chunk => { body += chunk.toString(); });
            response.on('end', () => response.statusCode === 200 ? resolve({ statusCode: response.statusCode, url: target.toString() }) :
                reject(new Error('Registered endpoint returned ' + response.statusCode + ' from ' + target + ': ' + body)));
        });
        request.on('error', reject);
        request.end();
    });
}

function selectRegisteredInstance(instances, moduleName, server) {
    let matches = instances.filter(instance => instance.moduleName === moduleName && instance.clientCallable &&
        (!server || instance.server === server));
    assert.strictEqual(matches.length, 1, 'Expected one registered endpoint for ' + moduleName +
        (server ? ' on ' + server : '') + ', found ' + matches.length);
    return matches[0];
}

async function runRegistryDirectConnectionSmoke(snapshot) {
    let targets = [
        ['profile', 'profileServer'], ['nems', 'nemsServer'], ['cronjob', 'cronServer'],
        ['dataConsumer', 'deapServer'],
        ['workflow', 'workflowServer'], ['cms', 'cmsStagedServer'], ['cms', 'cmsOnlineServer'],
        ['backoffice', 'backofficeServer']
    ];
    assert.throws(() => selectRegisteredInstance(snapshot.instances, 'cms'), /found 2/,
        'Multiple CMS runtimes must require explicit server selection');
    ['dataProcessor', 'dataPublisher'].forEach(moduleName => {
        let instance = snapshot.instances.find(item => item.moduleName === moduleName && item.server === 'deapServer');
        assert(instance && instance.clientCallable === false && instance.endpoint === undefined,
            moduleName + ' must remain internal composition rather than advertising a direct client endpoint');
    });
    let schemaModules = snapshot.instances.filter(instance => instance.clientCallable &&
        (instance.capabilities || []).includes('schema'));
    assert(schemaModules.some(instance => instance.moduleName === 'profile') && schemaModules.some(instance => instance.moduleName === 'cms'),
        'Capability filtering must retain modules that declare schema ownership');
    let calls = [];
    for (let [moduleName, server] of targets) {
        let instance = selectRegisteredInstance(snapshot.instances, moduleName, server);
        let response = await requestRegisteredEndpoint(instance);
        calls.push({ moduleName: moduleName, server: server, endpoint: instance.endpoint, statusCode: response.statusCode });
    }
    return { selectedEndpoints: calls.length, schemaCapabilityMatches: schemaModules.length,
        ambiguousCmsRejected: true, internalDeapModulesHidden: true, calls: calls };
}

function startServer(serverName, nodeName) {
    let args = ['-e', 'require("./nodics").start(); require("./startio/envs/startioLocal/test/topology/runtimeContractProbe").watch()',
        'ENV=startioLocal', 'SERVER=' + serverName];
    if (nodeName) {
        args.push('NODE=' + nodeName);
    }
    let label = nodeName ? serverName + '/' + nodeName : serverName;
    let port = getServerNodePort(serverName, nodeName);
    let output = '';
    let contractTimeout;
    let contractSnapshot;
    let child = spawn(process.execPath, args, {
        cwd: ROOT,
        env: Object.assign({}, process.env),
        stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    });

    let runtimeContract = new Promise((resolve, reject) => {
        contractTimeout = setTimeout(() => {
            reject(new Error(label + ' did not emit its runtime contract within ' + CONTRACT_TIMEOUT_MS + 'ms'));
        }, CONTRACT_TIMEOUT_MS);
        child.on('message', message => {
            if (!message || !message.type) return;
            if (message.type === 'nodics-runtime-contract') {
                clearTimeout(contractTimeout);
                contractSnapshot = message.snapshot;
                resolve(message.snapshot);
            } else if (message.type === 'nodics-runtime-contract-error') {
                clearTimeout(contractTimeout);
                reject(new Error(label + ' runtime contract failed: ' + message.error));
            }
        });
    });

    child.stdout.on('data', data => {
        output = (output + data.toString()).slice(-12000);
    });
    child.stderr.on('data', data => {
        output = (output + data.toString()).slice(-12000);
    });

    let exited = new Promise((resolve, reject) => {
        child.once('exit', code => {
            clearTimeout(contractTimeout);
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(label + ' exited with code ' + code + '\n' + output));
            }
        });
    });

    return Promise.race([
        Promise.all([waitForPort(port, STARTUP_TIMEOUT_MS), runtimeContract]),
        exited
    ]).then(() => {
        return {
            child,
            label,
            serverName,
            nodeName: nodeName || null,
            port,
            output: output,
            getOutput: () => output,
            contract: contractSnapshot
        };
    }).catch(error => {
        stopServer({ child, label }).finally(() => {});
        throw new Error(label + ' failed to start on port ' + port + ': ' + error.message + '\n' + output);
    });
}

function assertRuntimeContract(runtime) {
    const contract = runtime.contract;
    assert(contract, runtime.label + ' must emit a runtime contract');
    assert.strictEqual(contract.serverState, 'started', runtime.label + ' must reach started state');
    assert.strictEqual(contract.serverName, runtime.serverName, runtime.label + ' must report its selected server module');
    assert.strictEqual(contract.nodeName, runtime.nodeName, runtime.label + ' must report its selected node module');
    assert(contract.activeModules.length > 0, runtime.label + ' must load active modules');
    assert(contract.indexedModules.length > 0, runtime.label + ' must index active modules');
    assert(contract.indexedModules.every(moduleObject => moduleObject.name && moduleObject.kind), runtime.label + ' modules require metadata kind');
    assert(contract.activeTenants.includes('default'), runtime.label + ' must activate the default tenant');
    assert.strictEqual(contract.internalAuthReady, true, runtime.label + ' must initialize its internal auth token');
    assert.strictEqual(contract.apiContract.available, true, runtime.label + ' must expose its effective API contract: ' +
        JSON.stringify(contract.apiContract));
    if (contract.profileActive) {
        assert.deepStrictEqual(contract.mandatoryData, {
            enterprise: true,
            tenant: true,
            servicePrincipal: true,
            serviceGroup: true
        }, runtime.label + ' must expose mandatory profile bootstrap data');
    }
}

/** Proves that an environment-selected runtime contains every module required by its declared topology role. */
function assertRequiredModules(runtime, requiredModules) {
    (requiredModules || []).forEach(moduleName => assert(runtime.contract.activeModules.includes(moduleName),
        runtime.label + ' must activate required topology module: ' + moduleName));
}

function stopServer(runtime) {
    return new Promise(resolve => {
        if (!runtime || !runtime.child || runtime.child.killed) {
            resolve();
            return;
        }
        let done = false;
        function finish() {
            if (!done) {
                done = true;
                resolve();
            }
        }
        runtime.child.once('exit', finish);
        runtime.child.kill('SIGTERM');
        setTimeout(() => {
            if (!done) {
                runtime.child.kill('SIGKILL');
                finish();
            }
        }, SHUTDOWN_TIMEOUT_MS);
    });
}

function requestRegistrySnapshot(runtime) {
    let correlationId = 'registry-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
            runtime.child.removeListener('message', listener);
            reject(new Error(runtime.label + ' registry probe timed out'));
        }, 3000);
        function listener(message) {
            if (!message || message.type !== 'nodics-runtime-registry-response' || message.correlationId !== correlationId) return;
            clearTimeout(timeout);
            runtime.child.removeListener('message', listener);
            if (message.error) reject(new Error(message.error));
            else resolve(message.snapshot);
        }
        runtime.child.on('message', listener);
        runtime.child.send({ type: 'nodics-runtime-registry-request', correlationId: correlationId });
    });
}

function requestPublicationOperation(runtime, operation, payload) {
    let correlationId = 'publication-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
            runtime.child.removeListener('message', listener);
            reject(new Error(runtime.label + ' publication probe timed out for ' + operation));
        }, REGISTRY_TIMEOUT_MS);
        function listener(message) {
            if (!message || message.type !== 'nodics-runtime-publication-response' || message.correlationId !== correlationId) return;
            clearTimeout(timeout);
            runtime.child.removeListener('message', listener);
            if (message.error) reject(new Error(operation + ': ' + message.error));
            else resolve(message.result);
        }
        runtime.child.on('message', listener);
        runtime.child.send({ type: 'nodics-runtime-publication-request', correlationId: correlationId,
            operation: operation, payload: payload });
    });
}

async function runCmsPublicationSmoke(runtimes) {
    let staged = runtimes.find(runtime => runtime.serverName === 'cmsStagedServer');
    let onlineIndex = runtimes.findIndex(runtime => runtime.serverName === 'cmsOnlineServer');
    let online = runtimes[onlineIndex];
    assert(staged && online, 'CMS publication smoke requires separate Staged and Online runtimes');
    let suffix = Date.now().toString(36);
    let fixture = { tenant: 'default', site: 'runtime-' + suffix, path: '/runtime-' + suffix,
        pageCode: 'runtime-page-' + suffix, routeCode: 'runtime-route-' + suffix, locale: 'en', channel: 'web' };
    let publication = version => ({ code: 'runtime-release-' + suffix + '-v' + version, domain: 'cms',
        rootType: 'pageRoute', rootCode: fixture.routeCode, sourceVersion: String(version) });
    let carrier = version => ({ tenant: fixture.tenant, carrierCode: 'runtime-carrier-' + suffix + '-v' + version,
        items: [{ schemaName: 'cmsPageRoute', code: fixture.routeCode, versionId: version },
            { schemaName: 'cmsPage', code: fixture.pageCode, versionId: version }], publication: publication(version) });

    let roleBoundary = await requestPublicationOperation(staged, 'assertCmsSourceRoleBoundary', fixture);
    assert.strictEqual(roleBoundary.rejected, true, 'Staged runtime must reject target-side deployment authority');
    let targetRoutes = await requestPublicationOperation(online, 'inspectCmsPublicationRoutes', fixture);
    assert(targetRoutes.some(route => route.method === 'post' && route.url.endsWith('/cms/v0/publication/target/deploy')),
        'Online CMS must register its internal publication deployment route: ' + JSON.stringify(targetRoutes));
    let unauthenticatedTarget = await requestModuleEndpoint({ server: 'cmsOnlineServer', moduleName: 'cms',
        path: '/v0/publication/target/status', method: 'POST', expectedStatus: 401,
        headers: { 'content-type': 'application/json' }, body: { tenant: fixture.tenant, scope: fixture } });
    assert.strictEqual(unauthenticatedTarget.statusCode, 401,
        'Online publication target routes must reject requests without an internal service token');

    await requestPublicationOperation(staged, 'seedCmsRelease', Object.assign({}, fixture, { version: 0, pageName: 'Runtime page v1' }));
    let first;
    try {
        first = await requestPublicationOperation(staged, 'publishCmsRelease', carrier(0));
    } catch (error) {
        throw new Error(error.message + '\nStaged CMS output:\n' + (staged.getOutput ? staged.getOutput() : staged.output) +
            '\nOnline CMS output:\n' + (online.getOutput ? online.getOutput() : online.output));
    }
    assert.strictEqual(first.state, 'ONLINE');
    let firstOnline = await requestPublicationOperation(online, 'inspectCmsDelivery', fixture);
    assert.strictEqual(firstOnline.delivery.page.name, 'Runtime page v1');
    assert.strictEqual(firstOnline.manifestCode, first.targetVersion);
    assert.strictEqual(firstOnline.pointerCorrelationId, carrier(0).carrierCode,
        'Online pointer must retain the Staged publication correlation ID: ' + JSON.stringify(firstOnline));
    assert.strictEqual(firstOnline.receiptCorrelationId, carrier(0).carrierCode,
        'Online deployment receipt must retain the Staged publication correlation ID: ' + JSON.stringify(firstOnline));
    let replay = await requestPublicationOperation(staged, 'publishCmsRelease', carrier(0));
    let replayOnline = await requestPublicationOperation(online, 'inspectCmsDelivery', fixture);
    assert.strictEqual(replay.targetVersion, first.targetVersion);
    assert.strictEqual(replayOnline.receiptCount, firstOnline.receiptCount, 'idempotent replay must not duplicate deployment receipts');

    await requestPublicationOperation(staged, 'seedCmsRelease', Object.assign({}, fixture, { version: 1, pageName: 'Runtime page v2' }));
    let rejected = await requestPublicationOperation(staged, 'rejectCmsRelease', Object.assign({}, fixture, {
        publication: Object.assign({}, publication(1), { code: publication(1).code + '-rejected' })
    }));
    assert.strictEqual(rejected.state, 'REJECTED');
    let afterRejection = await requestPublicationOperation(online, 'inspectCmsDelivery', fixture);
    assert.strictEqual(afterRejection.manifestCode, first.targetVersion, 'rejected publication must not change Online content');

    let second = await requestPublicationOperation(staged, 'publishCmsRelease', carrier(1));
    let secondOnline = await requestPublicationOperation(online, 'inspectCmsDelivery', fixture);
    assert.strictEqual(secondOnline.delivery.page.name, 'Runtime page v2');
    assert.strictEqual(secondOnline.previousManifestCode, first.targetVersion);

    await stopServer(online);
    online = await startServer('cmsOnlineServer');
    assertRuntimeContract(online);
    runtimes[onlineIndex] = online;
    let recovered = await requestPublicationOperation(online, 'inspectCmsDelivery', fixture);
    assert.strictEqual(recovered.manifestCode, second.targetVersion, 'Online pointer must survive target restart');

    let rolledBack = await requestPublicationOperation(staged, 'rollbackCmsRelease', {
        tenant: fixture.tenant, publicationCode: publication(1).code
    });
    assert.strictEqual(rolledBack.state, 'ROLLED_BACK');
    let restored = await requestPublicationOperation(online, 'inspectCmsDelivery', fixture);
    assert.strictEqual(restored.manifestCode, first.targetVersion);
    assert.strictEqual(restored.delivery.page.name, 'Runtime page v1');

    await requestPublicationOperation(staged, 'seedCmsRelease', Object.assign({}, fixture, { version: 2, pageName: 'Runtime page v3' }));
    await stopServer(online);
    let outagePublication = Object.assign({}, publication(2), { code: publication(2).code + '-outage' });
    await assert.rejects(requestPublicationOperation(staged, 'publishCmsRelease', {
        tenant: fixture.tenant, carrierCode: 'runtime-carrier-' + suffix + '-outage', items: carrier(2).items,
        publication: outagePublication
    }), /publication|fetch|connect|ECONNREFUSED|target/i, 'Staged publication must fail closed while Online is unavailable');
    let failed = await requestPublicationOperation(staged, 'inspectCmsPublication', {
        tenant: fixture.tenant, publicationCode: outagePublication.code
    });
    assert.strictEqual(failed.state, 'FAILED', 'Online outage must leave an auditable failed publication');
    online = await startServer('cmsOnlineServer');
    assertRuntimeContract(online);
    runtimes[onlineIndex] = online;
    let afterOutage = await requestPublicationOperation(online, 'inspectCmsDelivery', fixture);
    assert.strictEqual(afterOutage.manifestCode, first.targetVersion, 'Online outage must not partially activate a new release');
    let recoveryPublication = Object.assign({}, publication(2), { code: publication(2).code + '-recovery' });
    let recoveredPublication = await requestPublicationOperation(staged, 'publishCmsRelease', {
        tenant: fixture.tenant, carrierCode: 'runtime-carrier-' + suffix + '-recovery', items: carrier(2).items,
        publication: recoveryPublication
    });
    assert.strictEqual(recoveredPublication.state, 'ONLINE');
    let recoveredDelivery = await requestPublicationOperation(online, 'inspectCmsDelivery', fixture);
    assert.strictEqual(recoveredDelivery.delivery.page.name, 'Runtime page v3');
    return { approved: true, rejected: true, unauthenticatedTargetRejected: true, idempotentReplay: true,
        restartRecovered: true, secondVersion: true, rollback: true, outageFailedClosed: true, outageRecovered: true };
}

async function waitForPricingPublication(runtime, publicationCode, states) {
    let startedAt = Date.now(), last;
    while (Date.now() - startedAt < REGISTRY_TIMEOUT_MS) {
        last = await requestPublicationOperation(runtime, 'inspectPricingPublication', { tenant: 'default', publicationCode: publicationCode });
        if (last && states.includes(last.state)) return last;
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    throw new Error('Pricing publication did not reach ' + states.join('/') + ': ' + JSON.stringify(last));
}

async function runPricingPublicationSmoke(runtimes) {
    let staged = runtimes.find(runtime => runtime.serverName === 'cmsStagedServer');
    let onlineIndex = runtimes.findIndex(runtime => runtime.serverName === 'cmsOnlineServer');
    let online = runtimes[onlineIndex];
    assert(staged && online, 'Pricing publication smoke requires separate Staged and Online runtimes');
    let suffix = Date.now().toString(36), fixture = { tenant: 'default', enterpriseCode: 'runtime-enterprise-' + suffix, priceListCode: 'runtime-pricing-' + suffix,
        assignmentCode: 'runtime-assignment-' + suffix, itemCode: 'runtime-item-' + suffix, currencyCode: 'AED', unitCode: 'piece' };
    let submissionCode = label => 'runtime-' + label + '-' + suffix, carrierCode = label => 'default::pricingPublication::' + submissionCode(label);
    let inspect = () => requestPublicationOperation(online, 'inspectPricingOnline', fixture);
    let roleBoundary = await requestPublicationOperation(staged, 'assertPricingSourceRoleBoundary', fixture);
    assert.strictEqual(roleBoundary.rejected, true, 'Staged Pricing must reject Online target authority');
    let targetRoutes = await requestPublicationOperation(online, 'inspectPricingPublicationRoutes', fixture);
    assert(targetRoutes.some(route => route.method === 'post' && route.url.endsWith('/pricing/v0/publication/target/deploy')), 'Online Pricing must expose its internal deployment route');
    let unauthenticated = await requestModuleEndpoint({ server: 'cmsOnlineServer', moduleName: 'pricing', path: '/v0/publication/target/status', method: 'POST', expectedStatus: 401, headers: { 'content-type': 'application/json' }, body: { scope: fixture } });
    assert.strictEqual(unauthenticated.statusCode, 401);
    await requestPublicationOperation(staged, 'ensurePricingWorkflowDefinitions', Object.assign({}, fixture, { modules: ['flowCore', 'units', 'pricing'] }));
    await requestPublicationOperation(online, 'ensurePricingWorkflowDefinitions', Object.assign({}, fixture, { modules: ['units'] }));
    await requestPublicationOperation(staged, 'seedPricingUnit', fixture);
    await requestPublicationOperation(online, 'seedPricingUnit', fixture);

    let stablePriceCode = 'runtime-price-' + suffix;
    let v1 = await requestPublicationOperation(staged, 'seedPricingRelease', Object.assign({}, fixture, { version: 0, priceCode: stablePriceCode, amount: '10.00' }));
    let manual = await requestPublicationOperation(staged, 'submitPricingRelease', Object.assign({}, fixture, { submissionCode: submissionCode('manual-v1'), approvalMode: 'MANUAL', decision: 'SUCCESS', sourceVersion: 0, items: v1.items }));
    let firstPublication = await waitForPricingPublication(staged, manual.carrierCode, ['ONLINE', 'FAILED']);
    if (firstPublication.state === 'FAILED') {
        let manifest = await requestPublicationOperation(staged, 'inspectPricingManifest', { tenant: fixture.tenant, publicationCode: manual.carrierCode });
        let diagnostic = await requestPublicationOperation(online, 'deployPricingManifestDirect', { tenant: fixture.tenant, manifest: manifest });
        throw new Error('Initial Pricing deployment failed: ' + JSON.stringify(diagnostic));
    }
    let firstOnline = await inspect();
    assert.strictEqual(firstOnline.resolution.amount, '10.00'); assert.strictEqual(firstOnline.manifestCode, firstPublication.targetVersion);
    let replay = await requestPublicationOperation(staged, 'submitPricingRelease', Object.assign({}, fixture, { submissionCode: submissionCode('manual-v1'), approvalMode: 'MANUAL', sourceVersion: 0, items: v1.items }));
    assert.strictEqual(replay.idempotent, true, 'Repeated Pricing submission must reuse its durable carrier');

    let v2 = await requestPublicationOperation(staged, 'seedPricingRelease', Object.assign({}, fixture, { version: 1, priceCode: stablePriceCode, amount: '12.00' }));
    let rejected = await requestPublicationOperation(staged, 'submitPricingRelease', Object.assign({}, fixture, { submissionCode: submissionCode('reject-v2'), approvalMode: 'MANUAL', decision: 'REJECT', sourceVersion: 1, items: v2.items }));
    let rejectedCarrier = await requestPublicationOperation(staged, 'inspectPricingWorkflow', { tenant: fixture.tenant, carrierCode: rejected.carrierCode });
    assert(rejectedCarrier.states.includes('FINISHED') || rejectedCarrier.active === false, 'Rejected Pricing workflow must terminate');
    assert.strictEqual((await inspect()).manifestCode, firstOnline.manifestCode, 'Rejected Pricing workflow must not change Online');

    let automatic = await requestPublicationOperation(staged, 'submitPricingRelease', Object.assign({}, fixture, { submissionCode: submissionCode('automatic-v2'), approvalMode: 'AUTOMATIC', sourceVersion: 1, items: v2.items }));
    let secondPublication = await waitForPricingPublication(staged, automatic.carrierCode, ['ONLINE']);
    let secondOnline = await inspect();
    assert.strictEqual(secondOnline.resolution.amount, '12.00', 'Activation must invalidate the cached prior price');
    assert.strictEqual(secondOnline.previousManifestCode, firstOnline.manifestCode);

    await stopServer(online); online = await startServer('cmsOnlineServer'); assertRuntimeContract(online); runtimes[onlineIndex] = online;
    let restarted = await inspect(); assert.strictEqual(restarted.manifestCode, secondPublication.targetVersion, 'Online Pricing pointer must survive restart');

    let rollback = await requestPublicationOperation(staged, 'rollbackPricingRelease', { tenant: fixture.tenant, enterpriseCode: fixture.enterpriseCode, publicationCode: automatic.carrierCode });
    assert.strictEqual(rollback.state, 'ROLLED_BACK');
    let restored = await inspect(); assert.strictEqual(restored.resolution.amount, '10.00', 'Rollback must invalidate cache and restore prior Pricing data');

    let v3 = await requestPublicationOperation(staged, 'seedPricingRelease', Object.assign({}, fixture, { version: 2, priceCode: stablePriceCode, amount: '15.00' }));
    await stopServer(online);
    let outage = await requestPublicationOperation(staged, 'submitPricingRelease', Object.assign({}, fixture, { submissionCode: submissionCode('outage-v3'), approvalMode: 'AUTOMATIC', sourceVersion: 2, items: v3.items }));
    await waitForPricingPublication(staged, outage.carrierCode, ['FAILED']);
    online = await startServer('cmsOnlineServer'); assertRuntimeContract(online); runtimes[onlineIndex] = online;
    assert.strictEqual((await inspect()).resolution.amount, '10.00', 'Failed deployment must not partially change Online');
    let recovery = await requestPublicationOperation(staged, 'submitPricingRelease', Object.assign({}, fixture, { submissionCode: submissionCode('recovery-v3'), approvalMode: 'AUTOMATIC', sourceVersion: 2, items: v3.items }));
    await waitForPricingPublication(staged, recovery.carrierCode, ['ONLINE']);
    assert.strictEqual((await inspect()).resolution.amount, '15.00');
    return { manualApproval: true, automaticApproval: true, rejection: true, idempotentSubmission: true, restartRecovery: true, rollback: true, cacheInvalidation: true, outageFailedClosed: true, outageRecovery: true };
}

async function waitForRegistry(runtime, predicate, description) {
    let startedAt = Date.now();
    let lastSnapshot;
    while (Date.now() - startedAt < REGISTRY_TIMEOUT_MS) {
        lastSnapshot = await requestRegistrySnapshot(runtime);
        if (predicate(lastSnapshot)) return lastSnapshot;
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    let summary = lastSnapshot && {
        activeInstances: lastSnapshot.instances && lastSnapshot.instances.length,
        registeredModules: lastSnapshot.instances && new Set(lastSnapshot.instances.map(instance => instance.moduleName)).size,
        discoveries: lastSnapshot.discoveries,
        contractPersistenceServices: lastSnapshot.contractPersistenceServices,
        contractPersistenceModels: lastSnapshot.contractPersistenceModels,
        contractPersistenceError: lastSnapshot.contractPersistenceError,
        durableContracts: lastSnapshot.durableContracts,
        availability: lastSnapshot.availability,
        discoveryDiagnostics: lastSnapshot.diagnostics && lastSnapshot.diagnostics.discovery
    };
    throw new Error('BackOffice registry did not satisfy ' + description + ': ' + JSON.stringify(summary));
}

/** Rejects registry snapshots that expose known credential or internal lease fields. */
function assertClientSafeRegistrySnapshot(snapshot) {
    let forbidden = new Set(['authorization', 'credential', 'password', 'privatekey', 'secret', 'token', 'expiresat']);
    function assertSafeKeys(value) {
        if (!value || typeof value !== 'object') return;
        Object.keys(value).forEach(key => {
            assert(!forbidden.has(key.toLowerCase()), 'Registry client projection must not expose ' + key);
            assertSafeKeys(value[key]);
        });
    }
    assertSafeKeys(snapshot.instances);
    snapshot.instances.forEach(instance => {
        assert(instance.moduleName && instance.instanceId && instance.environment && instance.server,
            'Every registry lease requires sanitized runtime coordinates');
        if (instance.clientCallable) assert(/^https?:\/\//.test(instance.endpoint),
            'Client-callable registry leases require an HTTP endpoint');
        else assert.strictEqual(instance.endpoint, undefined,
            'Non-client-callable registry leases must not expose an endpoint');
    });
}

/** Proves module registration, sanitization, discovery, and restart recovery inside monoServer. */
async function runConsolidatedRegistrySmoke(runtime) {
    let expectedModules = Array.from(new Set(runtime.contract.activeModules));
    let initial = await waitForRegistry(runtime, snapshot => {
        let observed = snapshot.instances.map(instance => instance.moduleName);
        return expectedModules.every(moduleName => observed.includes(moduleName)) &&
            snapshot.discoveries.some(discovery => discovery.moduleName === 'cms' && discovery.operations > 0) &&
            snapshot.availability.some(availability => availability.moduleName === 'cms' && availability.state === 'UP');
    }, 'monoServer registration of every active module');
    assertClientSafeRegistrySnapshot(initial);
    assert.strictEqual(new Set(initial.instances.map(instance => instance.instanceId)).size, 1,
        'monoServer modules must share one runtime instance identity');
    assert(initial.instances.every(instance => instance.environment === 'startioLocal' && instance.server === CONSOLIDATED_SERVER),
        'monoServer registry coordinates must be derived from the selected local runtime');
    let durableCms = initial.durableContracts.find(contract => contract.moduleName === 'cms');
    assert(durableCms && durableCms.hash && durableCms.activationRevision > 0,
        'monoServer must persist an active CMS contract observation');
    assert(initial.catalogue.cms && initial.catalogue.cms.activeModuleLeases === 1,
        'monoServer catalogue must aggregate CMS into one active module lease');
    return { expectedModules: expectedModules, durableCms: durableCms, initialInstanceId: initial.instances[0].instanceId };
}

async function runConsolidatedSmoke() {
    let runtime = await startServer(CONSOLIDATED_SERVER);
    try {
        assertRuntimeContract(runtime);
        assertRequiredModules(runtime, REQUIRED_CONSOLIDATED_MODULES);
        let registryBeforeRestart = await runConsolidatedRegistrySmoke(runtime);
        await stopServer(runtime);
        runtime = await startServer(CONSOLIDATED_SERVER);
        assertRuntimeContract(runtime);
        assertRequiredModules(runtime, REQUIRED_CONSOLIDATED_MODULES);
        let recoveredRegistry = await waitForRegistry(runtime, snapshot => {
            let observed = snapshot.instances.map(instance => instance.moduleName);
            let recoveredCms = snapshot.durableContracts.find(contract => contract.moduleName === 'cms');
            return registryBeforeRestart.expectedModules.every(moduleName => observed.includes(moduleName)) && recoveredCms &&
                recoveredCms.hash === registryBeforeRestart.durableCms.hash &&
                recoveredCms.activationRevision === registryBeforeRestart.durableCms.activationRevision;
        }, 'monoServer restart registration and durable CMS contract recovery');
        assertClientSafeRegistrySnapshot(recoveredRegistry);
        assert(!recoveredRegistry.instances.some(instance => instance.instanceId === registryBeforeRestart.initialInstanceId),
            'monoServer restart must replace the stopped process identity');
        return {
            runtime: runtime,
            communication: await runConsolidatedCommunicationSmoke(),
            readiness: await runRuntimeReadinessSmoke([runtime]),
            authentication: await runBackofficeHumanAuthenticationSmoke(),
            registry: {
                activeInstances: recoveredRegistry.diagnostics.activeInstances,
                registeredModules: Array.from(new Set(recoveredRegistry.instances.map(instance => instance.moduleName))).length,
                restartRecovered: true,
                durableContractRecovered: true,
                clientProjectionSanitized: true
            }
        };
    } finally {
        await stopServer(runtime);
    }
}

async function runModularSmoke() {
    let runtimes = [];
    try {
        for (let serverName of SERVER_ORDER) {
            let runtime = await startServer(serverName);
            assertRuntimeContract(runtime);
            assertRequiredModules(runtime, REQUIRED_MODULAR_MODULES[serverName]);
            runtimes.push(runtime);
        }
        let backofficeRuntime = runtimes.find(runtime => runtime.serverName === 'backofficeServer');
        let expectedModules = Array.from(new Set(runtimes.flatMap(runtime => runtime.contract.activeModules)));
        let initialRegistry = await waitForRegistry(backofficeRuntime, snapshot => {
            let observed = snapshot.instances.map(instance => instance.moduleName);
            return expectedModules.every(moduleName => observed.includes(moduleName)) &&
                snapshot.discoveries.some(discovery => discovery.moduleName === 'cms' && discovery.operations > 0) &&
                snapshot.availability.some(availability => availability.moduleName === 'cms' && availability.state === 'UP');
        }, 'registration of every active module and CMS capability discovery');

        assertClientSafeRegistrySnapshot(initialRegistry);
        let cmsInstances = initialRegistry.instances.filter(instance => instance.moduleName === 'cms');
        assert.strictEqual(cmsInstances.length, 2, 'Staged and Online CMS must register as two runtime instances');
        assert.deepStrictEqual(cmsInstances.map(instance => instance.server).sort(), ['cmsOnlineServer', 'cmsStagedServer']);
        assert.strictEqual(new Set(cmsInstances.map(instance => instance.instanceId)).size, 2,
            'Staged and Online CMS must retain distinct runtime identities');
        assert.strictEqual(new Set(cmsInstances.map(instance => instance.endpoint)).size, 2,
            'Staged and Online CMS must retain distinct direct-call endpoints');
        assert(initialRegistry.catalogue.cms && initialRegistry.catalogue.cms.activeModuleLeases === 2,
            'The CMS catalogue must aggregate both runtime leases under one CMS capability');
        assert.strictEqual(initialRegistry.cmsAdminDetail.instances.length, 2,
            'Administrative CMS detail must expose both sanitized runtime instances');

        let authenticationBeforeRestart = await runBackofficeHumanAuthenticationSmoke('profileServer', 'backofficeServer');
        let directConnections = await runRegistryDirectConnectionSmoke(initialRegistry);
        let profileIndex = runtimes.findIndex(runtime => runtime.serverName === 'profileServer');
        let previousProfileRuntime = runtimes[profileIndex];
        let previousProfileInstance = initialRegistry.instances.find(instance =>
            instance.moduleName === 'profile' && instance.server === 'profileServer').instanceId;
        let unrelatedInstanceIds = new Set(initialRegistry.instances.filter(instance => instance.server !== 'profileServer')
            .map(instance => instance.instanceId));
        await stopServer(previousProfileRuntime);
        let restartedProfileRuntime = await startServer('profileServer');
        assertRuntimeContract(restartedProfileRuntime);
        assertRequiredModules(restartedProfileRuntime, REQUIRED_MODULAR_MODULES.profileServer);
        runtimes[profileIndex] = restartedProfileRuntime;
        let profileReconciledRegistry = await waitForRegistry(backofficeRuntime, snapshot =>
            snapshot.instances.some(instance => instance.moduleName === 'profile' && instance.server === 'profileServer' &&
                instance.instanceId !== previousProfileInstance) &&
            !snapshot.instances.some(instance => instance.instanceId === previousProfileInstance) &&
            Array.from(unrelatedInstanceIds).every(instanceId => snapshot.instances.some(instance => instance.instanceId === instanceId)),
        'Profile restart reconciliation without unrelated lease loss');
        assertClientSafeRegistrySnapshot(profileReconciledRegistry);
        let authenticationAfterProfileRestart = await runBackofficeHumanAuthenticationSmoke('profileServer', 'backofficeServer');

        let cmsIndex = runtimes.findIndex(runtime => runtime.serverName === 'cmsStagedServer');
        let previousCmsRuntime = runtimes[cmsIndex];
        let previousCmsInstance = cmsInstances.find(instance => instance.server === 'cmsStagedServer').instanceId;
        await stopServer(previousCmsRuntime);
        let restartedCmsRuntime = await startServer('cmsStagedServer');
        assertRuntimeContract(restartedCmsRuntime);
        assertRequiredModules(restartedCmsRuntime, REQUIRED_MODULAR_MODULES.cmsStagedServer);
        runtimes[cmsIndex] = restartedCmsRuntime;
        let reconciledRegistry = await waitForRegistry(backofficeRuntime, snapshot => snapshot.instances.some(instance =>
            instance.moduleName === 'cms' && instance.server === 'cmsStagedServer' && instance.instanceId !== previousCmsInstance) &&
            snapshot.instances.some(instance => instance.moduleName === 'cms' && instance.server === 'cmsOnlineServer') &&
            !snapshot.instances.some(instance => instance.instanceId === previousCmsInstance), 'CMS restart reconciliation');
        let durableCms = reconciledRegistry.durableContracts.find(contract => contract.moduleName === 'cms');
        assert(durableCms && durableCms.hash && durableCms.activationRevision > 0, 'CMS durable contract pointer must be observable before restart');
        let publication = await runCmsPublicationSmoke(runtimes);
        let pricingPublication = await runPricingPublicationSmoke(runtimes);

        let backofficeIndex = runtimes.findIndex(runtime => runtime.serverName === 'backofficeServer');
        await stopServer(backofficeRuntime);
        let restartedBackofficeRuntime = await startServer('backofficeServer');
        assertRuntimeContract(restartedBackofficeRuntime);
        assertRequiredModules(restartedBackofficeRuntime, REQUIRED_MODULAR_MODULES.backofficeServer);
        runtimes[backofficeIndex] = restartedBackofficeRuntime;
        backofficeRuntime = restartedBackofficeRuntime;
        let recoveredRegistry = await waitForRegistry(backofficeRuntime, snapshot => {
            let observed = snapshot.instances.map(instance => instance.moduleName);
            let recoveredCms = snapshot.durableContracts.find(contract => contract.moduleName === 'cms');
            return expectedModules.every(moduleName => observed.includes(moduleName)) && recoveredCms &&
                recoveredCms.hash === durableCms.hash && recoveredCms.activationRevision === durableCms.activationRevision &&
                snapshot.discoveries.some(discovery => discovery.moduleName === 'cms' && discovery.hash === durableCms.hash) &&
                snapshot.availability.some(availability => availability.moduleName === 'cms' && availability.state === 'UP');
        }, 'BackOffice restart durable contract recovery');
        let authenticationAfterBackofficeRestart = await runBackofficeHumanAuthenticationSmoke('profileServer', 'backofficeServer');
        let recoveredDirectConnections = await runRegistryDirectConnectionSmoke(recoveredRegistry);
        assert.strictEqual(recoveredDirectConnections.selectedEndpoints, directConnections.selectedEndpoints,
            'BackOffice restart must preserve every selected direct module endpoint');
        return {
            runtimes: runtimes.slice(),
            communication: await runModularCommunicationSmoke(),
            readiness: await runRuntimeReadinessSmoke(runtimes),
            registry: {
                activeInstances: recoveredRegistry.diagnostics.activeInstances,
                registeredModules: Array.from(new Set(recoveredRegistry.instances.map(instance => instance.moduleName))).length,
                discoveredModules: recoveredRegistry.discoveries.length,
                cmsRuntimeInstances: recoveredRegistry.instances.filter(instance => instance.moduleName === 'cms').length,
                cmsInstanceSeparation: true,
                cmsCatalogueAggregated: recoveredRegistry.catalogue.cms && recoveredRegistry.catalogue.cms.activeModuleLeases === 2,
                profileRestartReconciled: true,
                unrelatedLeasesPreserved: true,
                cmsRestartReconciled: true,
                backofficeRestartRecovered: true,
                availabilityRecovered: recoveredRegistry.availability.some(availability =>
                    availability.moduleName === 'cms' && availability.state === 'UP')
            },
            authentication: {
                beforeRestart: authenticationBeforeRestart,
                afterProfileRestart: authenticationAfterProfileRestart,
                afterBackofficeRestart: authenticationAfterBackofficeRestart
            },
            directConnections: recoveredDirectConnections,
            publication: publication,
            pricingPublication: pricingPublication
        };
    } finally {
        for (let runtime of runtimes.reverse()) {
            await stopServer(runtime);
        }
    }
}

async function runModularCommunicationSmoke() {
    let results = [];
    for (let check of COMMUNICATION_CHECKS.filter(item => !item.topologies || item.topologies.includes('modular'))) {
        assert(check.server, 'communication check server is required');
        assert(check.moduleName, 'communication check moduleName is required for ' + check.server);
        results.push(await requestModuleEndpoint(check));
    }
    return results;
}

async function runConsolidatedCommunicationSmoke() {
    let results = [];
    for (let check of COMMUNICATION_CHECKS.filter(item => !item.topologies || item.topologies.includes('consolidated'))) {
        assert(check.moduleName, 'communication check moduleName is required for consolidated topology');
        results.push(await requestModuleEndpoint(Object.assign({}, check, {
            server: CONSOLIDATED_SERVER,
            node: undefined
        })));
    }
    return results;
}

async function runRuntimeReadinessSmoke(runtimes) {
    let results = [];
    for (let runtime of runtimes) {
        results.push(await requestModuleEndpoint({
            server: runtime.serverName,
            node: runtime.nodeName,
            moduleName: 'system',
            path: '/v0/health/ready'
        }));
        results.push(await requestModuleEndpoint({
            server: runtime.serverName,
            node: runtime.nodeName,
            moduleName: 'system',
            path: '/v0/health/ready/details',
            expectedStatus: 401
        }));
    }
    return results;
}

(async function () {
    console.log('Runtime topology smoke passed');
    console.log('Mode:', TOPOLOGY_MODE);

    if (TOPOLOGY_MODE === 'all' || TOPOLOGY_MODE === 'consolidated') {
        let consolidated = await runConsolidatedSmoke();
        console.log('Consolidated:', consolidated.runtime.label + ':' + consolidated.runtime.port);
        console.log('Consolidated communication:', consolidated.communication.map(item => item.url + ' -> ' + item.statusCode).join(', '));
        console.log('Consolidated readiness:', consolidated.readiness.map(item => item.url + ' -> ' + item.statusCode).join(', '));
        console.log('Consolidated authentication:', JSON.stringify(consolidated.authentication));
        console.log('Consolidated registry:', JSON.stringify(consolidated.registry));
    }

    if (TOPOLOGY_MODE === 'all' || TOPOLOGY_MODE === 'modular') {
        let modular = await runModularSmoke();
        assert.deepStrictEqual(modular.runtimes.map(item => item.label), SERVER_ORDER);
        console.log('Modular:', modular.runtimes.map(item => item.label + ':' + item.port).join(', '));
        console.log('Communication:', modular.communication.map(item => item.url + ' -> ' + item.statusCode).join(', '));
        console.log('Readiness:', modular.readiness.map(item => item.url + ' -> ' + item.statusCode).join(', '));
        console.log('Distributed authentication:', JSON.stringify(modular.authentication));
        console.log('Direct module connections:', JSON.stringify(modular.directConnections));
        console.log('Registry reconciliation:', JSON.stringify(modular.registry));
        console.log('CMS publication:', JSON.stringify(modular.publication));
        console.log('Pricing publication:', JSON.stringify(modular.pricingPublication));
    }
})().catch(error => {
    console.error(error.message || error);
    process.exit(1);
});

function getTopologyMode() {
    let mode = process.env.NODICS_TOPOLOGY_MODE || getArgValue('--mode=') || 'all';
    assert(['all', 'consolidated', 'modular'].includes(mode),
        'NODICS_TOPOLOGY_MODE/--mode must be one of: all, consolidated, modular');
    return mode;
}

function getArgValue(prefix) {
    let arg = process.argv.find(item => item.startsWith(prefix));
    return arg ? arg.substring(prefix.length) : null;
}
