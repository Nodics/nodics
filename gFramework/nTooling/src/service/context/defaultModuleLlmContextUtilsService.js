/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Enum = require('../../../../nConfig/bin/enum');
const toolingProperties = require('../../../config/properties');

/**
 * @module nTooling/service/context/defaultModuleLlmContextUtilsService
 * @description Shared project-aware discovery, ownership, schema bootstrap, fingerprint, and generated-directory utilities used by Nodics context and metadata commands.
 * @layer tooling
 * @owner nTooling
 * @override Tooling commands may compose these utilities, but project-root resolution and module ownership rules must remain consistent.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const discoveryConfig = toolingProperties.tooling && toolingProperties.tooling.discovery || {};
const ignoredDirectories = new Set(discoveryConfig.ignoredDirectories || []);
const ignoredFiles = new Set(discoveryConfig.ignoredFiles || []);

function toPosix(filePath) {
    return filePath.split(path.sep).join('/');
}

function toRelative(filePath) {
    return toPosix(path.relative(rootPath, filePath));
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function isModuleDirectory(directory) {
    return fs.existsSync(path.join(directory, 'nodics.js')) &&
        fs.existsSync(path.join(directory, 'package.json'));
}

function scanModules(directory = rootPath, modules = []) {
    if (!fs.existsSync(directory)) {
        return modules;
    }

    let entries = fs.readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .sort((left, right) => left.name.localeCompare(right.name));

    entries.forEach(entry => {
        if (ignoredDirectories.has(entry.name)) {
            return;
        }

        let entryPath = path.join(directory, entry.name);
        if (isModuleDirectory(entryPath)) {
            let packageJson = readJson(path.join(entryPath, 'package.json'));
            modules.push({
                name: packageJson.name || entry.name,
                index: packageJson.index,
                description: packageJson.description,
                path: entryPath,
                relativePath: toRelative(entryPath),
                packageJson: packageJson
            });
        }
        scanModules(entryPath, modules);
    });

    return modules.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function ensureDirectory(directory) {
    fs.mkdirSync(directory, { recursive: true });
}

function removeDirectory(directory) {
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

function collectFiles(directory, matcher, files = []) {
    if (!fs.existsSync(directory)) {
        return files;
    }

    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        let entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (!ignoredDirectories.has(entry.name)) {
                collectFiles(entryPath, matcher, files);
            }
            return;
        }
        if (ignoredFiles.has(entry.name)) {
            return;
        }
        if (!matcher || matcher(entryPath)) {
            files.push(toRelative(entryPath));
        }
    });

    return files.sort();
}

function collectModuleOwnedFiles(modulePath) {
    const files = [];
    const ignoredModuleDirectories = new Set([
        ...ignoredDirectories,
        'gen'
    ]);

    function walk(directory) {
        if (!fs.existsSync(directory)) {
            return;
        }
        fs.readdirSync(directory, { withFileTypes: true })
            .sort((left, right) => left.name.localeCompare(right.name))
            .forEach(entry => {
                const entryPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                    if (ignoredModuleDirectories.has(entry.name)) {
                        return;
                    }
                    if (entryPath !== modulePath && isModuleDirectory(entryPath)) {
                        return;
                    }
                    if (entry.name === 'llm') {
                        const readmePath = path.join(entryPath, 'README.md');
                        if (fs.existsSync(readmePath)) {
                            files.push(toRelative(readmePath));
                        }
                        return;
                    }
                    walk(entryPath);
                    return;
                }
                if (!ignoredFiles.has(entry.name)) {
                    files.push(toRelative(entryPath));
                }
            });
    }

    walk(modulePath);
    return files.sort();
}

function createFilesFingerprint(relativeFiles) {
    const hash = crypto.createHash('sha256');
    (relativeFiles || []).slice().sort().forEach(relativeFile => {
        const absolutePath = path.join(rootPath, relativeFile);
        hash.update(relativeFile);
        hash.update('\0');
        hash.update(fs.readFileSync(absolutePath));
        hash.update('\0');
    });
    return hash.digest('hex');
}

function getRelativeIfExists(modulePath, relativePath) {
    let targetPath = path.join(modulePath, relativePath);
    return fs.existsSync(targetPath) ? toRelative(targetPath) : null;
}

function loadLocalSchemas(modulePath) {
    let schemaPath = path.join(modulePath, 'src', 'schemas', 'schemas.js');
    if (!fs.existsSync(schemaPath)) {
        return {
            schemas: {},
            error: null
        };
    }

    try {
        delete require.cache[require.resolve(schemaPath)];
        return {
            schemas: require(schemaPath) || {},
            error: null
        };
    } catch (error) {
        return {
            schemas: {},
            error: error.message
        };
    }
}

function createEnumOptions(enumName, enumDefinition) {
    if (!enumDefinition || !enumDefinition._options) {
        return undefined;
    }
    return {
        name: enumDefinition._options.name || enumName,
        separator: enumDefinition._options.separator || '|',
        ignoreCase: enumDefinition._options.ignoreCase || false,
        freez: enumDefinition._options.freez || false,
        endianness: enumDefinition._options.endianness
    };
}

function bootstrapSchemaGlobals(modules = scanModules()) {
    global.ENUMS = global.ENUMS || {};
    modules.forEach(module => {
        let enumPath = path.join(module.path, 'src', 'utils', 'enums.js');
        if (!fs.existsSync(enumPath)) {
            return;
        }
        delete require.cache[require.resolve(enumPath)];
        let enumScript = require(enumPath);
        Object.keys(enumScript || {}).forEach(enumName => {
            let enumDefinition = enumScript[enumName];
            if (enumDefinition && enumDefinition.definition) {
                global.ENUMS[enumName] = new Enum(enumDefinition.definition, createEnumOptions(enumName, enumDefinition));
            }
        });
    });
}

function listFeatureFolders(modulePath) {
    return [
        'config',
        'data',
        'src/schemas',
        'src/router',
        'src/controller',
        'src/facade',
        'src/service',
        'src/pipelines',
        'src/interceptors',
        'src/event',
        'src/search',
        'src/utils',
        'test'
    ].filter(relativePath => fs.existsSync(path.join(modulePath, relativePath)));
}

function getModuleKind(module) {
    if (module.packageJson && module.packageJson.nodics && module.packageJson.nodics.kind) {
        return module.packageJson.nodics.kind;
    }

    let relativePath = module.relativePath;
    if (relativePath === 'gSetup') {
        return 'setup';
    }
    let pathParts = relativePath.split('/');
    let envGroupIndex = pathParts.findIndex(part => /Envs$/.test(part));
    if (envGroupIndex >= 0) {
        let hierarchyDepth = pathParts.length - envGroupIndex - 1;
        return ['group', 'group', 'server'][hierarchyDepth] || 'node';
    }
    if (pathParts.some(part => /Modules$/.test(part))) {
        return 'capability';
    }
    if (pathParts.length === 1 && !relativePath.startsWith('gFramework') && !relativePath.startsWith('gCore')) {
        return 'application';
    }
    if (relativePath.includes('/templates/')) {
        return 'template';
    }
    if (relativePath.startsWith('gFramework')) {
        return 'capability';
    }
    if (relativePath.startsWith('gCore')) {
        return 'capability';
    }
    return 'capability';
}

function getModuleRuntime(module) {
    if (module.packageJson && module.packageJson.nodics && module.packageJson.nodics.runtime) {
        return module.packageJson.nodics.runtime;
    }
    return {};
}

function getModuleRuntimeSummary(module) {
    let runtime = getModuleRuntime(module);
    let enabled = Object.keys(runtime).sort().filter(key => runtime[key] === true);
    return enabled.length ? enabled.join(', ') : 'none';
}

module.exports = {
    rootPath,
    toRelative,
    ensureDirectory,
    removeDirectory,
    collectFiles,
    collectModuleOwnedFiles,
    createFilesFingerprint,
    getRelativeIfExists,
    getModuleKind,
    getModuleRuntime,
    getModuleRuntimeSummary,
    listFeatureFolders,
    loadLocalSchemas,
    scanModules,
    bootstrapSchemaGlobals
};
