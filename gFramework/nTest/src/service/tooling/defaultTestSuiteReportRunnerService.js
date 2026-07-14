/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * @module nTest/service/tooling/defaultTestSuiteReportRunnerService
 * @description Runs an arbitrary project test command, streams its output, extracts Nodics test metrics, and writes a structured report under the selected server module.
 * @layer tooling
 * @owner nTest
 * @override Projects may explicitly replace report parsing or command execution while retaining truthful exit status and output traceability.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());

function loadProjectDefaultServer() {
    let envPath = path.join(rootPath, 'env.js');
    if (!fs.existsSync(envPath)) {
        return undefined;
    }
    delete require.cache[require.resolve(envPath)];
    let projectEnv = require(envPath);
    return projectEnv && projectEnv.defaultOptions ? projectEnv.defaultOptions.defaultServer : undefined;
}

function findModulePath(moduleName, currentPath) {
    if (!moduleName || !fs.existsSync(currentPath)) {
        return undefined;
    }
    let entries = fs.readdirSync(currentPath, { withFileTypes: true });
    let packagePath = path.join(currentPath, 'package.json');
    if (fs.existsSync(packagePath)) {
        let packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (packageJson.name === moduleName) {
            return currentPath;
        }
    }
    for (let entry of entries) {
        if (!entry.isDirectory() || ['.git', 'node_modules', 'generated', 'temp'].includes(entry.name)) {
            continue;
        }
        let result = findModulePath(moduleName, path.join(currentPath, entry.name));
        if (result) {
            return result;
        }
    }
    return undefined;
}

function resolveServerModulePath(serverName) {
    let selectedServer = serverName || process.env.SERVER || process.env.S || loadProjectDefaultServer();
    if (!selectedServer) {
        throw new Error('A server must be selected with --server, SERVER, S, or defaultOptions.defaultServer');
    }
    let serverPath = findModulePath(selectedServer, rootPath);
    if (!serverPath) {
        throw new Error('Unable to resolve server module: ' + selectedServer);
    }
    let packageJson = JSON.parse(fs.readFileSync(path.join(serverPath, 'package.json'), 'utf8'));
    if (!packageJson.nodics || packageJson.nodics.kind !== 'server') {
        throw new Error('Test report owner must be a server module: ' + selectedServer);
    }
    return serverPath;
}

function resolveServerReportDir(serverName) {
    return path.join(resolveServerModulePath(serverName), 'generated', 'test-reports');
}

function assertServerOwnedReportDir(reportDir, serverName) {
    let serverPath = path.resolve(resolveServerModulePath(serverName));
    let resolvedReportDir = path.resolve(reportDir);
    if (resolvedReportDir.indexOf(serverPath + path.sep) !== 0) {
        throw new Error('Test reports must be written under the selected server module: ' + serverPath);
    }
    return resolvedReportDir;
}

function runCli() {
    let args = parseArgs(process.argv.slice(2));
    if (!args.command.length) {
        console.error('Usage: npm run test:full:report -- --suite=<name> -- <command> [args...]');
        process.exit(1);
    }

    let startedAt = new Date();
    let output = '';
    let child = spawn(args.command[0], args.command.slice(1), {
        cwd: rootPath,
        env: Object.assign({}, process.env, {
            SERVER: args.serverName
        }),
        shell: false
    });

    child.stdout.on('data', data => {
        let text = data.toString();
        output += text;
        process.stdout.write(text);
    });
    child.stderr.on('data', data => {
        let text = data.toString();
        output += text;
        process.stderr.write(text);
    });
    child.on('error', error => {
        output += error.stack || error.message;
    });
    child.on('close', code => {
        let endedAt = new Date();
        let report = createReport({
            suiteName: args.suiteName,
            command: args.command,
            output: output,
            exitCode: code,
            startedAt: startedAt,
            endedAt: endedAt,
            env: Object.assign({}, process.env, {
                SERVER: args.serverName
            })
        });
        let reportPath = writeReport(report, args.reportDir);
        console.log('\nTest report:', path.relative(rootPath, reportPath));
        process.exit(code || 0);
    });
}

function parseArgs(argv) {
    let separatorIndex = argv.indexOf('--');
    let optionArgs = separatorIndex >= 0 ? argv.slice(0, separatorIndex) : argv;
    let command = separatorIndex >= 0 ? argv.slice(separatorIndex + 1) : [];
    let suiteName = 'test';
    let reportDir;
    let serverName;

    optionArgs.forEach(arg => {
        if (arg.startsWith('--suite=')) {
            suiteName = arg.substring('--suite='.length);
        } else if (arg.startsWith('--server=')) {
            serverName = arg.substring('--server='.length);
        } else if (arg.startsWith('--report-dir=')) {
            reportDir = path.resolve(rootPath, arg.substring('--report-dir='.length));
        }
    });

    serverName = serverName || process.env.SERVER || process.env.S || loadProjectDefaultServer();
    reportDir = reportDir || process.env.NODICS_TEST_REPORT_DIR || resolveServerReportDir(serverName);
    reportDir = assertServerOwnedReportDir(reportDir, serverName);

    return {
        suiteName: suiteName,
        serverName: serverName,
        reportDir: reportDir,
        command: command
    };
}

function createReport(options) {
    let parsed = parseOutput(options.output || '', {
        fallbackModuleName: options.suiteName
    });
    return {
        reportType: 'nodics-test-suite',
        reportVersion: 1,
        suiteName: options.suiteName,
        status: options.exitCode === 0 ? 'PASSED' : 'FAILED',
        exitCode: options.exitCode,
        command: options.command,
        startedAt: options.startedAt.toISOString(),
        endedAt: options.endedAt.toISOString(),
        durationMs: options.endedAt.getTime() - options.startedAt.getTime(),
        environment: createEnvironmentSummary(options.env || {}),
        summary: parsed.summary,
        topology: parsed.topology,
        modules: parsed.modules,
        suites: parsed.suites,
        tests: parsed.tests,
        failures: options.exitCode === 0 ? [] : parsed.failures
    };
}

function parseOutput(output, options) {
    let lines = String(output || '').split(/\r?\n/);
    let suites = [];
    let tests = [];
    let modules = new Set();
    let topology = {
        mode: undefined,
        consolidated: [],
        modular: [],
        communication: []
    };
    let failures = [];

    lines.forEach(line => {
        let npmMatch = line.match(/^> nodics@[^ ]+ ([^ ]+)/);
        if (npmMatch) {
            suites.push({
                name: npmMatch[1],
                source: 'npm'
            });
        }

        let runningMatch = line.match(/^Running (.+\.test\.js)$/);
        if (runningMatch) {
            let testPath = runningMatch[1];
            tests.push({
                name: path.basename(testPath),
                path: testPath,
                moduleName: inferModuleName(testPath),
                status: 'PASSED'
            });
            let moduleName = inferModuleName(testPath);
            if (moduleName) {
                modules.add(moduleName);
            }
        }

        collectCountTests(line, tests, modules);
        collectTopology(line, topology);

        if (/failed|error/i.test(line) && !/0 failed/i.test(line)) {
            failures.push(line);
        }
    });

    topology.communication.forEach(item => {
        let moduleName = inferModuleNameFromUrl(item);
        tests.push({
            name: 'topology-communication',
            path: item,
            moduleName: moduleName,
            status: 'PASSED',
            aggregate: true
        });
        if (moduleName) {
            modules.add(moduleName);
        }
    });
    if (tests.length === 0 && suites.length > 0) {
        suites.forEach(suite => {
            let moduleName = (options && options.fallbackModuleName) || inferModuleNameFromSuite(suite.name);
            tests.push({
                name: suite.name,
                path: undefined,
                moduleName: moduleName,
                status: 'PASSED',
                aggregate: true
            });
            if (moduleName) {
                modules.add(moduleName);
            }
        });
    }

    return {
        summary: {
            suiteCount: suites.length,
            testCount: tests.length,
            passedCount: tests.length,
            failedCount: 0,
            skippedCount: 0
        },
        topology: topology,
        modules: Array.from(modules).sort(),
        suites: suites,
        tests: tests,
        failures: failures
    };
}

function collectCountTests(line, tests, modules) {
    let generatedMatch = line.match(/^Generated tests passed(?:[^:]*): (\d+)/);
    if (generatedMatch) {
        addAggregatedTests(tests, modules, 'generated', Number(generatedMatch[1]));
    }
    let routeMatch = line.match(/^Route contract tests passed: (\d+)/);
    if (routeMatch) {
        addAggregatedTests(tests, modules, 'route-contract', Number(routeMatch[1]));
    }
    let capabilityMatch = line.match(/^Capability behavior tests passed(?:[^:]*): (\d+)/);
    if (capabilityMatch) {
        addAggregatedTests(tests, modules, 'capability-behavior', Number(capabilityMatch[1]));
    }
}

function addAggregatedTests(tests, modules, name, count) {
    for (let index = 0; index < count; index++) {
        tests.push({
            name: name,
            path: undefined,
            moduleName: undefined,
            status: 'PASSED',
            aggregate: true
        });
    }
    modules.add(name);
}

function collectTopology(line, topology) {
    let modeMatch = line.match(/^Mode: (.+)$/);
    if (modeMatch) {
        topology.mode = modeMatch[1];
    }
    let consolidatedMatch = line.match(/^Consolidated: (.+)$/);
    if (consolidatedMatch) {
        topology.consolidated = consolidatedMatch[1].split(',').map(item => item.trim()).filter(Boolean);
    }
    let modularMatch = line.match(/^Modular: (.+)$/);
    if (modularMatch) {
        topology.modular = modularMatch[1].split(',').map(item => item.trim()).filter(Boolean);
    }
    let communicationMatch = line.match(/^(?:Consolidated communication|Communication): (.+)$/);
    if (communicationMatch) {
        topology.communication = topology.communication.concat(
            communicationMatch[1].split(',').map(item => item.trim()).filter(Boolean)
        );
    }
}

function createEnvironmentSummary(env) {
    return {
        nodicsEnv: env.NODICS_ENV || null,
        server: env.SERVER || env.S || null,
        node: getRuntimeNodeName(env) || null,
        tenant: env.NODICS_TEST_TENANT || null,
        enterprise: env.NODICS_TEST_ENTERPRISE || null,
        policyTenant: env.NODICS_TEST_POLICY_TENANT || env.NODICS_TEST_CONTROL_TENANT || null,
        topologyMode: env.NODICS_TOPOLOGY_MODE || null
    };
}

function getRuntimeNodeName(env) {
    if (env.NODICS_NODE) {
        return env.NODICS_NODE;
    }
    if (env.NODICS_TEST_NODE) {
        return env.NODICS_TEST_NODE;
    }
    if (env.NODE && !env.NODE.includes('/') && !env.NODE.includes('\\')) {
        return env.NODE;
    }
    return undefined;
}

function inferModuleName(testPath) {
    if (!testPath) {
        return undefined;
    }
    let parts = testPath.split(/[\\/]/);
    let testIndex = parts.indexOf('test');
    if (testIndex > 0) {
        return parts[testIndex - 1];
    }
    return undefined;
}

function inferModuleNameFromUrl(value) {
    let match = String(value || '').match(/\/nodics\/([^/]+)\//);
    return match ? match[1] : undefined;
}

function inferModuleNameFromSuite(suiteName) {
    let value = String(suiteName || '');
    let match = value.match(/^test:([^:\s]+)/);
    return match ? match[1] : undefined;
}

function writeReport(report, reportDir) {
    fs.mkdirSync(reportDir, { recursive: true });
    let safeSuiteName = String(report.suiteName || 'test').replace(/[^a-zA-Z0-9_-]/g, '_');
    let fileName = safeSuiteName + '-' + report.startedAt.replace(/[:.]/g, '-') + '.json';
    let reportPath = path.join(reportDir, fileName);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 4));
    return reportPath;
}

module.exports = {
    createReport,
    parseArgs,
    parseOutput,
    resolveServerReportDir,
    assertServerOwnedReportDir
};

if (require.main === module) {
    runCli();
}
