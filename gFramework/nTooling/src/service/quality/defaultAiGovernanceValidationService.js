/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/service/quality/defaultAiGovernanceValidationService
 * @description Validates portable AI-agent governance files, canonical module guidance, README casing, tool bridge files, and generated-context entrypoints across a Nodics workspace.
 * @layer tooling
 * @owner nTooling
 * @override Projects may add stricter AI governance checks, but must preserve AGENTS.md as the canonical portable instruction contract.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const ignoredDirectories = new Set([
    '.git',
    'node_modules',
    'logs',
    'temp',
    'tmp',
    'dist',
    'generated'
]);

const requiredRootFiles = [
    'AGENTS.md',
    'CLAUDE.md',
    'CONVENTIONS.md',
    '.github/copilot-instructions.md',
    '.cursor/rules/nodics-core.mdc',
    'gSetup/llm/README.md',
    'gSetup/llm/ai-manifest.json',
    'gSetup/llm/contracts/nodics-principles.md',
    'gSetup/llm/contracts/module-structure-contract.md',
    'gSetup/llm/contracts/documentation-impact-contract.md',
    'gSetup/llm/contracts/testing-and-release-contract.md',
    'gSetup/llm/contracts/customer-project-mode-contract.md'
];

/**
 * Converts a filesystem path to a repository-relative POSIX path.
 *
 * @param {string} filePath Absolute or workspace-relative filesystem path.
 * @returns {string} POSIX-style path relative to the workspace root.
 */
function toRelative(filePath) {
    return path.relative(rootPath, filePath).split(path.sep).join('/');
}

/**
 * Recursively walks the workspace while skipping generated and external folders.
 *
 * @param {string} directory Directory to scan.
 * @param {Function} visitor Function invoked for every discovered entry.
 */
function walk(directory, visitor) {
    if (!fs.existsSync(directory)) return;
    fs.readdirSync(directory, { withFileTypes: true })
        .sort((left, right) => left.name.localeCompare(right.name))
        .forEach(entry => {
            if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return;
            let entryPath = path.join(directory, entry.name);
            visitor(entryPath, entry);
            if (entry.isDirectory()) walk(entryPath, visitor);
        });
}

/**
 * Finds all package-shaped directories in the workspace.
 *
 * @returns {string[]} Package directories sorted by relative path.
 */
function findPackageDirectories() {
    let directories = [];
    if (fs.existsSync(path.join(rootPath, 'package.json'))) {
        directories.push(rootPath);
    }
    walk(rootPath, (entryPath, entry) => {
        if (!entry.isDirectory()) return;
        if (fs.existsSync(path.join(entryPath, 'package.json'))) {
            directories.push(entryPath);
        }
    });
    return Array.from(new Set(directories)).sort((left, right) => toRelative(left).localeCompare(toRelative(right)));
}

/**
 * Reads a UTF-8 file when it exists.
 *
 * @param {string} relativePath Workspace-relative path.
 * @returns {string} File content or an empty string.
 */
function readRelative(relativePath) {
    let filePath = path.join(rootPath, relativePath);
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

/**
 * Records a validation failure.
 *
 * @param {string[]} failures Mutable failure list.
 * @param {string} message Failure message.
 */
function fail(failures, message) {
    failures.push(message);
}

/**
 * Validates root-level canonical AI files and bridge files.
 *
 * @param {string[]} failures Mutable failure list.
 */
function validateRootFiles(failures) {
    requiredRootFiles.forEach(relativePath => {
        if (!fs.existsSync(path.join(rootPath, relativePath))) {
            fail(failures, 'Missing AI governance file: ' + relativePath);
        }
    });

    let rootAgents = readRelative('AGENTS.md');
    let normalizedRootAgents = rootAgents.toLowerCase();
    [
        'capabilities are sacred, implementations are negotiable',
        'documentation impact contract',
        'customer/project module',
        'standard module shape'
    ].forEach(clause => {
        if (!normalizedRootAgents.includes(clause)) {
            fail(failures, 'Root AGENTS.md is missing required clause: ' + clause);
        }
    });

    [
        'CLAUDE.md',
        'CONVENTIONS.md',
        '.github/copilot-instructions.md',
        '.cursor/rules/nodics-core.mdc'
    ].forEach(relativePath => {
        let content = readRelative(relativePath);
        if (!content.includes('AGENTS.md')) {
            fail(failures, 'AI bridge must point to AGENTS.md: ' + relativePath);
        }
    });

    try {
        let manifest = JSON.parse(readRelative('gSetup/llm/ai-manifest.json'));
        if (manifest.manifestSchemaVersion !== 1) {
            fail(failures, 'AI manifest manifestSchemaVersion must be 1');
        }
        if (manifest.canonicalInstructionFile !== 'AGENTS.md') {
            fail(failures, 'AI manifest canonicalInstructionFile must be AGENTS.md');
        }
        if (manifest.humanReadmeFile !== 'README.md') {
            fail(failures, 'AI manifest humanReadmeFile must be README.md');
        }
    } catch (error) {
        fail(failures, 'AI manifest must be valid JSON: ' + error.message);
    }
}

/**
 * Validates package-level AI and human documentation entrypoints.
 *
 * @param {string[]} failures Mutable failure list.
 */
function validatePackageFiles(failures) {
    findPackageDirectories().forEach(directory => {
        let relativePath = toRelative(directory) || '.';
        let readmeNames = fs.readdirSync(directory).filter(name => /^readme\.md$/i.test(name));
        if (readmeNames.length !== 1 || readmeNames[0] !== 'README.md') {
            fail(failures, 'Package must contain exactly one uppercase README.md: ' + relativePath);
        }
        if (!fs.existsSync(path.join(directory, 'AGENTS.md'))) {
            fail(failures, 'Package is missing AGENTS.md: ' + relativePath);
        }
        [
            'docs/README.md',
            'llm/README.md',
            'llm/contracts/README.md',
            'llm/examples/README.md'
        ].forEach(relativeFile => {
            if (!fs.existsSync(path.join(directory, relativeFile))) {
                fail(failures, 'Package is missing mandatory AI/documentation file: ' + relativePath + '/' + relativeFile);
            }
        });
        let llmDirectory = path.join(directory, 'llm');
        if (fs.existsSync(llmDirectory) && !fs.existsSync(path.join(llmDirectory, 'README.md'))) {
            fail(failures, 'Module llm directory is missing README.md: ' + relativePath + '/llm');
        }
    });
}

/**
 * Validates that lowercase README names are not reintroduced anywhere.
 *
 * @param {string[]} failures Mutable failure list.
 */
function validateReadmeCasing(failures) {
    walk(rootPath, (entryPath, entry) => {
        if (entry.isFile() && entry.name === 'readme.md') {
            fail(failures, 'Lowercase readme.md is not allowed: ' + toRelative(entryPath));
        }
    });
}

/**
 * Runs AI governance validation and exits with a non-zero code on failure.
 */
function run() {
    let failures = [];
    validateRootFiles(failures);
    validatePackageFiles(failures);
    validateReadmeCasing(failures);

    if (failures.length > 0) {
        console.error('Nodics AI governance validation failed:');
        failures.forEach(failure => console.error('- ' + failure));
        process.exit(1);
    }
    console.log('Nodics AI governance validated');
}

if (require.main === module) {
    run();
}

module.exports = {
    run,
    validateRootFiles,
    validatePackageFiles,
    validateReadmeCasing,
    findPackageDirectories
};
