/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
    'gSetup/llm/ai-enablement-index.md',
    'gSetup/llm/ai-manifest.json',
    'gSetup/llm/contracts/nodics-principles.md',
    'gSetup/llm/contracts/module-structure-contract.md',
    'gSetup/llm/contracts/documentation-impact-contract.md',
    'gSetup/llm/contracts/testing-and-release-contract.md',
    'gSetup/llm/contracts/customer-project-mode-contract.md',
    'gSetup/llm/memory/README.md',
    'gSetup/llm/memory/decisions.md'
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
            if (entry.isDirectory() && entryPath === path.join(rootPath, 'docs')) return;
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
 * Finds all AGENTS.md files governed by the workspace instruction contract.
 *
 * @returns {string[]} AGENTS.md file paths sorted by relative path.
 */
function findAgentFiles() {
    let files = [];
    let rootAgents = path.join(rootPath, 'AGENTS.md');
    if (fs.existsSync(rootAgents)) {
        files.push(rootAgents);
    }
    walk(rootPath, (entryPath, entry) => {
        if (entry.isFile() && entry.name === 'AGENTS.md') {
            files.push(entryPath);
        }
    });
    return Array.from(new Set(files)).sort((left, right) => toRelative(left).localeCompare(toRelative(right)));
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
    if (fs.existsSync(path.join(rootPath, 'llm'))) {
        fail(
            failures,
            'Repository root must not contain a parallel llm directory; global AI guidance belongs in gSetup/llm'
        );
    }
    if (fs.existsSync(path.join(rootPath, 'memory'))) {
        fail(
            failures,
            'Repository root must not contain a parallel memory directory; curated shared memory belongs in gSetup/llm/memory'
        );
    }

    let rootAgents = readRelative('AGENTS.md');
    let normalizedRootAgents = rootAgents.toLowerCase();
    [
        'capabilities are sacred, implementations are negotiable',
        'required reading order',
        'operating modes and authority',
        'pre-implementation study gate',
        'nodics delivery expert council',
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
        if (!content.includes('root-to-leaf') && !content.includes('ancestor module `AGENTS.md`')) {
            fail(failures, 'AI bridge must preserve root-to-leaf AGENTS.md guidance: ' + relativePath);
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
        if (directory !== rootPath) {
            [
                'llm/contracts/README.md',
                'llm/examples/README.md'
            ].forEach(relativeFile => {
                if (!fs.existsSync(path.join(directory, relativeFile))) {
                    fail(failures, 'Package is missing mandatory AI/documentation file: ' + relativePath + '/' + relativeFile);
                }
            });
        }
        if (directory !== rootPath && fs.existsSync(path.join(directory, 'docs'))) {
            fail(
                failures,
                'Package must not contain a parallel module docs directory; keep the local entry point in README.md ' +
                'and detailed guidance in the canonical documentation content pack: ' + relativePath + '/docs'
            );
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
 * Validates AGENTS.md inheritance links and canonical AI guidance references.
 *
 * @param {string[]} failures Mutable failure list.
 */
function validateAgentFiles(failures) {
    let rootAgentsPath = path.join(rootPath, 'AGENTS.md');
    let globalGuidancePath = path.join(rootPath, 'gSetup', 'llm', 'ai-enablement-index.md');
    findAgentFiles().forEach(filePath => {
        if (filePath === rootAgentsPath) return;

        let relativePath = toRelative(filePath);
        let content = fs.readFileSync(filePath, 'utf8');
        let references = Array.from(content.matchAll(/`([^`]*(?:AGENTS\.md|gSetup\/llm\/ai-enablement-index\.md|llm\/ai-enablement-index\.md))`/g))
            .map(match => match[1]);
        let resolvedReferences = references.map(reference => ({
            reference,
            resolvedPath: path.resolve(path.dirname(filePath), reference)
        }));

        resolvedReferences.forEach(resolvedReference => {
            if (!fs.existsSync(resolvedReference.resolvedPath)) {
                fail(
                    failures,
                    'AGENTS.md reference must resolve: ' + relativePath + ' -> ' + resolvedReference.reference
                );
            }
        });

        if (!resolvedReferences.some(resolvedReference => resolvedReference.resolvedPath === rootAgentsPath)) {
            fail(failures, 'AGENTS.md must reference the root AI contract: ' + relativePath);
        }
        if (!resolvedReferences.some(resolvedReference => resolvedReference.resolvedPath === globalGuidancePath)) {
            fail(failures, 'AGENTS.md must reference global gSetup/llm guidance: ' + relativePath);
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
    validateAgentFiles(failures);

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
    validateAgentFiles,
    findAgentFiles,
    findPackageDirectories
};
