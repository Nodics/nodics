const assert = require('assert');
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');
const _ = require('lodash');

const ROOT = path.resolve(__dirname, '../../..');
const LOCAL_ENV = path.join(ROOT, 'kickoff/kickoffEnvs/kickoffLocal');
const environmentProperties = require(path.join(LOCAL_ENV, 'config/properties.js'));
const STARTUP_TIMEOUT_MS = Number(process.env.NODICS_TOPOLOGY_TIMEOUT_MS || 60000);
const SHUTDOWN_TIMEOUT_MS = 5000;
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
    let nodes = props.server && props.server.default && props.server.default.nodes;
    assert(nodes && Object.keys(nodes).length > 0, 'server.default.nodes must define at least one node for ' + serverName);
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
    assert(props.server && props.server.default && props.server.default.nodes, 'server.default.nodes is required for ' + serverName);
    assert(props.server.default.nodes[nodeId], serverName + ' does not define node: ' + nodeId);
    return props.server.default.nodes[nodeId].httpPort;
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
                if (response.statusCode === 200) {
                    resolve({
                        statusCode: response.statusCode,
                        body: body,
                        url: 'http://127.0.0.1:' + port + requestPath
                    });
                } else {
                    reject(new Error('Unexpected status ' + response.statusCode + ' from ' + requestPath + ': ' + body));
                }
            });
        });
        request.on('error', reject);
        request.end();
    });
}

function startServer(serverName, nodeName) {
    let args = ['-e', 'require("./nodics").start()', 'SERVER=' + serverName];
    if (nodeName) {
        args.push('NODE=' + nodeName);
    }
    let label = nodeName ? serverName + '/' + nodeName : serverName;
    let port = getServerNodePort(serverName, nodeName);
    let output = '';
    let child = spawn(process.execPath, args, {
        cwd: ROOT,
        env: Object.assign({}, process.env)
    });

    child.stdout.on('data', data => {
        output = (output + data.toString()).slice(-12000);
    });
    child.stderr.on('data', data => {
        output = (output + data.toString()).slice(-12000);
    });

    let exited = new Promise((resolve, reject) => {
        child.once('exit', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(label + ' exited with code ' + code + '\n' + output));
            }
        });
    });

    return Promise.race([
        waitForPort(port, STARTUP_TIMEOUT_MS),
        exited
    ]).then(() => {
        return {
            child,
            label,
            port,
            output: output
        };
    }).catch(error => {
        stopServer({ child, label }).finally(() => {});
        throw new Error(label + ' failed to start on port ' + port + ': ' + error.message + '\n' + output);
    });
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
    await stopServer(runtime);
    return runtime;
}

async function runModularSmoke() {
    let runtimes = [];
    try {
        for (let serverName of SERVER_ORDER) {
            let runtime = await startServer(serverName);
            runtimes.push(runtime);
        }
        return {
            runtimes: runtimes.slice(),
            communication: await runModularCommunicationSmoke()
        };
    } finally {
        for (let runtime of runtimes.reverse()) {
            await stopServer(runtime);
        }
    }
}

async function runModularCommunicationSmoke() {
    let results = [];
    for (let check of COMMUNICATION_CHECKS) {
        assert(check.server, 'communication check server is required');
        assert(check.moduleName, 'communication check moduleName is required for ' + check.server);
        results.push(await requestModuleEndpoint(check));
    }
    return results;
}

(async function () {
    let consolidated = await runConsolidatedSmoke();

    let modular = await runModularSmoke();
    assert.deepStrictEqual(modular.runtimes.map(item => item.label), SERVER_ORDER);

    console.log('Runtime topology smoke passed');
    console.log('Consolidated:', consolidated.label + ':' + consolidated.port);
    console.log('Modular:', modular.runtimes.map(item => item.label + ':' + item.port).join(', '));
    console.log('Communication:', modular.communication.map(item => item.url + ' -> ' + item.statusCode).join(', '));
})().catch(error => {
    console.error(error.message || error);
    process.exit(1);
});
