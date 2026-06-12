const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootPath = path.resolve(__dirname, '..');
const skippedDirectories = new Set(['.git', 'node_modules']);

function collectRouteContractTests(currentPath, tests = []) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach((entry) => {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
            if (!skippedDirectories.has(entry.name)) {
                collectRouteContractTests(entryPath, tests);
            }
            return;
        }

        const isRouteContractTest = entry.name.endsWith('RouteContract.test.js')
            && entryPath.split(path.sep).includes('test');
        if (isRouteContractTest) {
            tests.push(entryPath);
        }
    });

    return tests;
}

const tests = collectRouteContractTests(rootPath).sort();

if (tests.length === 0) {
    console.log('No route contract tests found.');
    process.exit(0);
}

tests.forEach((testPath) => {
    const relativePath = path.relative(rootPath, testPath);
    console.log(`\nRunning ${relativePath}`);
    const result = spawnSync(process.execPath, [testPath], {
        cwd: rootPath,
        stdio: 'inherit'
    });

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
});

console.log(`\nRoute contract tests passed: ${tests.length}`);
