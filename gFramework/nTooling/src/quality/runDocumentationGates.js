/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const documentationCoverage = require('./checkDocumentationCoverage');

/**
 * @module nTooling/quality/runDocumentationGates
 * @description Applies project-overridable documentation governance configuration to enforced and report-only coverage gates.
 * @layer tooling
 * @owner nTooling
 * @override Projects may supply `--governance`, `NODICS_DOCUMENTATION_GOVERNANCE`, or an explicit command replacement.
 */

const frameworkRootDir = path.resolve(__dirname, '../../../..');

function readOption(args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
}

function resolveRootDir(args) {
    const configuredHome = readOption(args, '--home', process.env.NODICS_HOME || '');
    return configuredHome ? path.resolve(configuredHome) : process.cwd();
}

function resolveGovernancePath(args, rootDir) {
    const configuredPath = readOption(args, '--governance', process.env.NODICS_DOCUMENTATION_GOVERNANCE || '');
    if (configuredPath) {
        return path.resolve(rootDir, configuredPath);
    }
    const projectPath = path.join(rootDir, 'gFramework', 'nTooling', 'config', 'documentation-governance.json');
    return fs.existsSync(projectPath) ? projectPath :
        path.join(frameworkRootDir, 'gFramework', 'nTooling', 'config', 'documentation-governance.json');
}

function toArgs(gate, fail, rootDir) {
    const args = [
        '--home=' + rootDir,
        '--scope=' + (gate.scope || 'all'),
        '--limit=' + (gate.limit || 30)
    ];
    if (gate.module) {
        args.push('--module=' + gate.module);
    }
    if (gate.layer) {
        args.push('--layer=' + gate.layer);
    }
    if (gate.includeTests) {
        args.push('--include-tests');
    }
    if (fail) {
        args.push('--fail');
    }
    return args;
}

function printGateHeader(type, gate) {
    console.log('\n' + type + ': ' + gate.name);
    if (gate.description) {
        console.log(gate.description);
    }
}

function runGate(type, gate, fail, rootDir) {
    printGateHeader(type, gate);
    const options = documentationCoverage.createOptions(toArgs(gate, fail, rootDir));
    const report = documentationCoverage.collectCoverage(options);
    documentationCoverage.printReport(report, options.reportLimit);
    return documentationCoverage.hasMissingDocumentation(report);
}

function run(args) {
    const rootDir = resolveRootDir(args || []);
    const governancePath = resolveGovernancePath(args || [], rootDir);
    const governance = JSON.parse(fs.readFileSync(governancePath, 'utf8'));
    const enforcedGates = governance.enforcedGates || [];
    const reportOnlyGates = governance.reportOnlyGates || [];
    let hasFailure = false;

    console.log('Nodics documentation governance');
    console.log('Governance file            : ' + path.relative(rootDir, governancePath));

    enforcedGates.forEach(gate => {
        if (runGate('ENFORCED', gate, true, rootDir)) {
            hasFailure = true;
        }
    });

    reportOnlyGates.forEach(gate => {
        runGate('REPORT ONLY', gate, false, rootDir);
    });

    if (hasFailure) {
        console.error('\nDocumentation governance failed. Fix the enforced gate regressions before building.');
        process.exitCode = 1;
    } else {
        console.log('\nDocumentation governance passed.');
    }
}

if (require.main === module) {
    run(process.argv.slice(2));
}

module.exports = {
    resolveGovernancePath,
    resolveRootDir,
    run
};
