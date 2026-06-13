const fs = require('fs');
const path = require('path');
const documentationCoverage = require('./check-documentation-coverage');

const rootDir = path.resolve(__dirname, '..');
const governancePath = path.join(rootDir, 'docs', 'documentation-governance.json');

function toArgs(gate, fail) {
    const args = [
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

function runGate(type, gate, fail) {
    printGateHeader(type, gate);
    const options = documentationCoverage.createOptions(toArgs(gate, fail));
    const report = documentationCoverage.collectCoverage(options);
    documentationCoverage.printReport(report, options.reportLimit);
    return documentationCoverage.hasMissingDocumentation(report);
}

function run() {
    const governance = JSON.parse(fs.readFileSync(governancePath, 'utf8'));
    const enforcedGates = governance.enforcedGates || [];
    const reportOnlyGates = governance.reportOnlyGates || [];
    let hasFailure = false;

    console.log('Nodics documentation governance');
    console.log('Governance file            : ' + path.relative(rootDir, governancePath));

    enforcedGates.forEach(gate => {
        if (runGate('ENFORCED', gate, true)) {
            hasFailure = true;
        }
    });

    reportOnlyGates.forEach(gate => {
        runGate('REPORT ONLY', gate, false);
    });

    if (hasFailure) {
        console.error('\nDocumentation governance failed. Fix the enforced gate regressions before building.');
        process.exitCode = 1;
    } else {
        console.log('\nDocumentation governance passed.');
    }
}

run();
