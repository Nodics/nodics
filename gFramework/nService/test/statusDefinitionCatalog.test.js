const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../..');
const ignoredDirectories = new Set(['.git', 'node_modules']);
const statusCodePattern = /(?:code\s*:\s*|new\s+CLASSES\.(?:NodicsError|[A-Za-z0-9_]+Error)\(\s*|DefaultStatusService\.get\(\s*|\.enrich\([\s\S]{0,120}?)['"]((?:SUC|ERR)_[A-Z0-9]+_\d{5})['"]/g;

function walk(directory, callback) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        if (ignoredDirectories.has(entry.name)) {
            return;
        }
        let currentPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            walk(currentPath, callback);
        } else if (entry.isFile()) {
            callback(currentPath);
        }
    });
}

function collectJavaScriptFiles() {
    let files = [];
    walk(rootDir, filePath => {
        if (filePath.endsWith('.js')) {
            files.push(filePath);
        }
    });
    return files;
}

function collectStatusDefinitions(javaScriptFiles) {
    let definitions = {};
    let invalidDefinitions = [];
    javaScriptFiles.filter(filePath => filePath.endsWith('/src/utils/statusDefinitions.js')).forEach(filePath => {
        let moduleDefinitions = require(filePath);
        Object.keys(moduleDefinitions || {}).forEach(statusCode => {
            let definition = moduleDefinitions[statusCode];
            let httpCode = Number(definition && definition.code);
            if (!definition || !Number.isInteger(httpCode) || httpCode < 100 || httpCode > 599 || !definition.message) {
                invalidDefinitions.push({
                    statusCode: statusCode,
                    file: path.relative(rootDir, filePath)
                });
            }
            definitions[statusCode] = {
                file: filePath,
                definition: definition
            };
        });
    });
    return {
        definitions: definitions,
        invalidDefinitions: invalidDefinitions
    };
}

function collectUsedStatusCodes(javaScriptFiles) {
    let usages = {};
    javaScriptFiles.filter(filePath => filePath.indexOf(path.sep + 'test' + path.sep) === -1).forEach(filePath => {
        let contents = fs.readFileSync(filePath, 'utf8');
        let match;
        while ((match = statusCodePattern.exec(contents)) !== null) {
            usages[match[1]] = usages[match[1]] || [];
            usages[match[1]].push(path.relative(rootDir, filePath));
        }
    });
    return usages;
}

const javaScriptFiles = collectJavaScriptFiles();
const statusCatalog = collectStatusDefinitions(javaScriptFiles);
const statusUsages = collectUsedStatusCodes(javaScriptFiles);
const missingDefinitions = Object.keys(statusUsages).filter(statusCode => !statusCatalog.definitions[statusCode]).map(statusCode => {
    return {
        statusCode: statusCode,
        files: Array.from(new Set(statusUsages[statusCode])).sort()
    };
});

assert.deepStrictEqual(statusCatalog.invalidDefinitions, [], 'Invalid status definitions found');
assert.deepStrictEqual(missingDefinitions, [], 'Used status codes must be defined by module-owned statusDefinitions.js files');

console.log(`Status definition catalog validated: ${Object.keys(statusCatalog.definitions).length} definitions`);
