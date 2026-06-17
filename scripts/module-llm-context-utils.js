const fs = require('fs');
const path = require('path');
const Enum = require('../gFramework/nConfig/bin/enum');

const rootPath = path.resolve(__dirname, '..');
const ignoredDirectories = new Set([
    '.git',
    '.idea',
    '.vscode',
    'node_modules',
    'logs',
    'temp',
    'tmp',
    'dist',
    'generated',
    'docs'
]);

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
                type: packageJson.type,
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
        if (!matcher || matcher(entryPath)) {
            files.push(toRelative(entryPath));
        }
    });

    return files.sort();
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
    let relativePath = module.relativePath;
    if (relativePath === 'gSetup') {
        return 'llm-setup';
    }
    if (relativePath.includes('/kickoffEnvs/') || relativePath.includes('/gframesEnvs/')) {
        if (/Node\d+$/.test(module.name)) {
            return 'node';
        }
        if (/Server$/.test(module.name)) {
            return 'server';
        }
        return 'environment';
    }
    if (relativePath.includes('/kickoffModules/') || relativePath.includes('/gframesModules/')) {
        return 'application-module';
    }
    if (relativePath.startsWith('kickoff') || relativePath.startsWith('gframes')) {
        return 'application';
    }
    if (relativePath.includes('/templates/')) {
        return 'module-template';
    }
    if (relativePath.startsWith('gFramework')) {
        return 'framework';
    }
    if (relativePath.startsWith('gCore')) {
        return 'core';
    }
    return 'capability';
}

module.exports = {
    rootPath,
    toRelative,
    ensureDirectory,
    removeDirectory,
    collectFiles,
    getRelativeIfExists,
    getModuleKind,
    listFeatureFolders,
    loadLocalSchemas,
    scanModules,
    bootstrapSchemaGlobals
};
