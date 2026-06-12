const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootPath = path.resolve(__dirname, '..');
const marker = '@nodics-capability-behavior';
const skippedDirectories = new Set(['.git', 'node_modules']);
const areaArg = process.argv.find((arg) => arg.startsWith('--area='));
const selectedArea = areaArg ? areaArg.substring('--area='.length) : null;

function hasSelectedArea(content) {
    if (!selectedArea) {
        return true;
    }
    return content.includes(`@nodics-area ${selectedArea}`);
}

function collectCapabilityBehaviorTests(currentPath, tests = []) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach((entry) => {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
            if (!skippedDirectories.has(entry.name)) {
                collectCapabilityBehaviorTests(entryPath, tests);
            }
            return;
        }

        if (!entry.name.endsWith('.test.js') || !entryPath.split(path.sep).includes('test')) {
            return;
        }

        const content = fs.readFileSync(entryPath, 'utf8');
        if (content.includes(marker) && hasSelectedArea(content)) {
            tests.push(entryPath);
        }
    });

    return tests;
}

const tests = collectCapabilityBehaviorTests(rootPath).sort();

if (tests.length === 0) {
    const areaText = selectedArea ? ` for area ${selectedArea}` : '';
    console.log(`No capability behavior tests found${areaText}.`);
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

const areaText = selectedArea ? ` for area ${selectedArea}` : '';
console.log(`\nCapability behavior tests passed${areaText}: ${tests.length}`);
