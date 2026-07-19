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
const TOPOLOGY_MODE = getTopologyMode();
const TOPOLOGY_CONFIG = _.get(environmentProperties, 'test.runtimeTopology', {});
const CONSOLIDATED_SERVER = TOPOLOGY_CONFIG.consolidatedServer;
const SERVER_ORDER = TOPOLOGY_CONFIG.modularServers || [];
const COMMUNICATION_CHECKS = TOPOLOGY_CONFIG.communicationChecks || [];

assert(CONSOLIDATED_SERVER, 'test.runtimeTopology.consolidatedServer is required');
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
        method: options.method || 'GET'
    };
    return new Promise((resolve, reject) => {
        let request = http.request(requestOptions, response => {
            let body = '';
            response.on('data', chunk => {
                body += chunk.toString();
            });
            response.on('end', () => {
                let expectedStatus = options.expectedStatus || 200;
                if (response.statusCode === expectedStatus) {
                    resolve({
                        statusCode: response.statusCode,
                        body: body,
                        url: 'http://127.0.0.1:' + port + requestPath
                    });
                } else {
                    reject(new Error('Unexpected status ' + response.statusCode + ' from ' + requestPath +
                        '; expected ' + expectedStatus + ': ' + body));
                }
            });
        });
        request.on('error', reject);
        request.end();
    });
}

function startServer(serverName, nodeName) {
    let args = ['-e', 'require("./nodics").start(); require("./startio/envs/startioLocal/test/topology/runtimeContractProbe").watch()', 'SERVER=' + serverName];
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
    if (contract.profileActive) {
        assert.deepStrictEqual(contract.mandatoryData, {
            enterprise: true,
            tenant: true,
            servicePrincipal: true,
            serviceGroup: true
        }, runtime.label + ' must expose mandatory profile bootstrap data');
    }
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

async function runConsolidatedSmoke() {
    let runtime = await startServer(CONSOLIDATED_SERVER);
    try {
        assertRuntimeContract(runtime);
        return {
            runtime: runtime,
            communication: await runConsolidatedCommunicationSmoke(),
            readiness: await runRuntimeReadinessSmoke([runtime])
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
            runtimes.push(runtime);
        }
        return {
            runtimes: runtimes.slice(),
            communication: await runModularCommunicationSmoke(),
            readiness: await runRuntimeReadinessSmoke(runtimes)
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
    }

    if (TOPOLOGY_MODE === 'all' || TOPOLOGY_MODE === 'modular') {
        let modular = await runModularSmoke();
        assert.deepStrictEqual(modular.runtimes.map(item => item.label), SERVER_ORDER);
        console.log('Modular:', modular.runtimes.map(item => item.label + ':' + item.port).join(', '));
        console.log('Communication:', modular.communication.map(item => item.url + ' -> ' + item.statusCode).join(', '));
        console.log('Readiness:', modular.readiness.map(item => item.url + ' -> ' + item.statusCode).join(', '));
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
