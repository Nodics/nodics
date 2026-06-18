const fs = require('fs');
const path = require('path');

const {
    bootstrapSchemaGlobals,
    collectFiles,
    collectModuleOwnedFiles,
    createFilesFingerprint,
    ensureDirectory,
    getModuleKind,
    getModuleRuntime,
    getModuleRuntimeSummary,
    getRelativeIfExists,
    listFeatureFolders,
    loadLocalSchemas,
    scanModules
} = require('./module-llm-context-utils');

function formatList(items, emptyText) {
    if (!items || items.length === 0) {
        return '- ' + emptyText;
    }
    return items.map(item => '- `' + item + '`').join('\n');
}

function formatValue(value) {
    if (value === undefined || value === null || value === '') {
        return 'not defined';
    }
    if (Array.isArray(value)) {
        return value.length ? value.join(', ') : 'none';
    }
    return String(value);
}

function collectModuleFiles(module) {
    const ownedFiles = collectModuleOwnedFiles(module.path);
    return {
        sourceFiles: collectFiles(path.join(module.path, 'src'), filePath => filePath.endsWith('.js')),
        testFiles: collectFiles(path.join(module.path, 'test'), filePath => filePath.endsWith('.js')),
        dataFiles: collectFiles(path.join(module.path, 'data'), () => true),
        ownedFiles: ownedFiles,
        sourceFingerprint: createFilesFingerprint(ownedFiles)
    };
}

function getFileArea(module, relativeFile) {
    const moduleRelativePath = relativeFile.slice(module.relativePath.length + 1);
    if (moduleRelativePath === 'nodics.js') {
        return 'module';
    }
    if (moduleRelativePath === 'package.json' || /^readme\.md$/i.test(moduleRelativePath)) {
        return 'metadata';
    }
    return moduleRelativePath.split('/')[0] || 'root';
}

function isDocumentationRequired(module, relativeFile) {
    return relativeFile.endsWith('.js');
}

function extractDescription(content) {
    const match = content.match(/@description\s+([^@]*?)(?=\n\s*\*\s*@|\*\/)/);
    if (!match) {
        return '';
    }
    return match[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*?\s?/, '').trim())
        .filter(Boolean)
        .join(' ');
}

function findExportedMethods(content) {
    const methods = [];
    const exportIndex = content.indexOf('module.exports');
    if (exportIndex < 0) {
        return methods;
    }
    const methodPattern = /(?:^|\n)(\s*)([A-Za-z_$][\w$]*)\s*:\s*(?:async\s+)?function\s*\(/g;
    let match;
    while ((match = methodPattern.exec(content)) !== null) {
        methods.push({
            name: match[2],
            index: match.index + match[0].indexOf(match[2])
        });
    }
    return methods;
}

function hasMethodDocumentation(content, methodIndex) {
    const beforeMethod = content.slice(Math.max(0, methodIndex - 2000), methodIndex);
    const lastDocStart = beforeMethod.lastIndexOf('/**');
    const lastDocEnd = beforeMethod.lastIndexOf('*/');
    return lastDocStart >= 0 && lastDocEnd >= lastDocStart &&
        beforeMethod.slice(lastDocEnd + 2).trim().length === 0;
}

function analyzeOwnedFile(module, relativeFile) {
    const required = isDocumentationRequired(module, relativeFile);
    const absolutePath = path.join(__dirname, '..', relativeFile);
    if (!required) {
        return {
            path: relativeFile,
            area: getFileArea(module, relativeFile),
            documentationStatus: 'inventory-only',
            purpose: 'Tracked as module-owned context; source JSDoc is not required for this file type.',
            documentationIssues: [],
            exportedMethods: 0,
            documentedMethods: 0
        };
    }

    const content = fs.readFileSync(absolutePath, 'utf8');
    const exportIndex = content.indexOf('module.exports');
    const header = exportIndex >= 0 ? content.slice(0, exportIndex) : content;
    const fileDocumentation = (header.match(/\/\*\*[\s\S]*?\*\//g) || [])
        .find(block => block.includes('@module') || block.includes('@description')) || '';
    const requiredTags = ['@module', '@description', '@layer', '@owner', '@override'];
    const documentationIssues = requiredTags
        .filter(tag => !fileDocumentation.includes(tag))
        .map(tag => 'add ' + tag);
    const methods = findExportedMethods(content);
    const documentedMethods = methods.filter(method => hasMethodDocumentation(content, method.index)).length;
    if (documentedMethods < methods.length) {
        documentationIssues.push('add JSDoc for ' + (methods.length - documentedMethods) + ' exported method(s)');
    }
    let documentationStatus = 'undocumented';
    if (documentationIssues.length === 0) {
        documentationStatus = 'documented';
    } else if (fileDocumentation || documentedMethods > 0) {
        documentationStatus = 'partially-documented';
    }

    return {
        path: relativeFile,
        area: getFileArea(module, relativeFile),
        documentationStatus: documentationStatus,
        purpose: extractDescription(header) || 'Purpose is not documented; inspect the implementation and add a platform-level `@description`.',
        documentationIssues: documentationIssues,
        exportedMethods: methods.length,
        documentedMethods: documentedMethods
    };
}

function analyzeOwnedFiles(module, files) {
    return files.ownedFiles.map(relativeFile => analyzeOwnedFile(module, relativeFile));
}

function summarizeFileDocumentation(fileInventory) {
    return fileInventory.reduce((summary, file) => {
        summary[file.documentationStatus] = (summary[file.documentationStatus] || 0) + 1;
        return summary;
    }, {
        documented: 0,
        'partially-documented': 0,
        undocumented: 0,
        'inventory-only': 0
    });
}

function escapeTableValue(value) {
    return String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function summarizeSchema(schemaObject) {
    let definition = schemaObject.definition || {};
    return {
        super: schemaObject.super || '',
        model: !!schemaObject.model,
        serviceEnabled: !!(schemaObject.service && schemaObject.service.enabled),
        routerEnabled: !!(schemaObject.router && schemaObject.router.enabled),
        cacheEnabled: !!(schemaObject.cache && schemaObject.cache.enabled),
        searchEnabled: !!(schemaObject.search && schemaObject.search.enabled),
        eventEnabled: !!(schemaObject.event && schemaObject.event.enabled),
        tenants: schemaObject.tenants || [],
        properties: Object.keys(definition).sort().map(propertyName => {
            let property = definition[propertyName] || {};
            return {
                name: propertyName,
                type: property.type || 'object',
                required: !!property.required,
                description: property.description || ''
            };
        })
    };
}

function createReadme(module) {
    return [
        '# ' + module.name + ' LLM Context',
        '',
        'This folder contains module-owned LLM context for `' + module.name + '`.',
        '',
        'Human-authored files in this folder should explain module intent, ownership, extension rules, runtime contracts, and project customization guidance. Generated files must stay under `generated/` and are recreated from Nodics source definitions during build.',
        '',
        'Recommended use:',
        '',
        '1. Read `gSetup/llm/README.md` first for global Nodics rules.',
        '2. Read this module context before changing `' + module.name + '`.',
        '3. Read `generated/module-context.md`, `generated/schemas.md`, and `generated/tests.md` for current source-derived facts.',
        '4. For project-specific overrides, read the later module layer before changing out-of-the-box Nodics code.',
        '',
        'Do not hardcode this module into framework behavior. Use active modules, layered configuration, schemas, runtime governance, and tenant context.'
    ].join('\n') + '\n';
}

function createModuleContext(module, files, schemaGroups, fileInventory) {
    let featureFolders = listFeatureFolders(module.path);
    let documentation = summarizeFileDocumentation(fileInventory);
    let nodicsMetadata = module.packageJson.nodics || {};
    let schemaCount = Object.keys(schemaGroups).reduce((count, moduleName) => {
        return count + Object.keys(schemaGroups[moduleName] || {}).length;
    }, 0);

    return [
        '# ' + module.name + ' Module Context',
        '',
        '> Generated by `npm run llm:generate`. Do not edit this file directly.',
        '',
        '## Identity',
        '',
        '| Field | Value |',
        '| --- | --- |',
        '| Module | `' + module.name + '` |',
        '| Path | `' + module.relativePath + '` |',
        '| Kind | `' + getModuleKind(module) + '` |',
        '| Runtime | `' + getModuleRuntimeSummary(module) + '` |',
        '| Index | `' + formatValue(module.index) + '` |',
        '| Version | `' + formatValue(module.packageJson.version) + '` |',
        '| Description | ' + formatValue(module.description) + ' |',
        '',
        '## Module-Owned Folders',
        '',
        formatList(featureFolders, 'No standard module feature folders were found.'),
        '',
        '## Source Summary',
        '',
        '| Area | Count |',
        '| --- | ---: |',
        '| Source files | ' + files.sourceFiles.length + ' |',
        '| Test files | ' + files.testFiles.length + ' |',
        '| Data files | ' + files.dataFiles.length + ' |',
        '| All module-owned files | ' + files.ownedFiles.length + ' |',
        '| Local schema definitions | ' + schemaCount + ' |',
        '',
        '## Ownership And Dependencies',
        '',
        '**Owned extension areas**',
        '',
        formatList(nodicsMetadata.owns || [], 'No owned extension areas are declared in `package.json.nodics.owns`.'),
        '',
        '**Required modules**',
        '',
        formatList(module.packageJson.requiredModules || [], 'No required modules are declared.'),
        '',
        '**Contained modules**',
        '',
        formatList(module.packageJson.modules || [], 'This package does not declare contained modules.'),
        '',
        '## Documentation Status',
        '',
        '| Status | Files |',
        '| --- | ---: |',
        '| Documented | ' + documentation.documented + ' |',
        '| Partially documented | ' + documentation['partially-documented'] + ' |',
        '| Undocumented | ' + documentation.undocumented + ' |',
        '| Inventory only | ' + documentation['inventory-only'] + ' |',
        '',
        '## Important Files',
        '',
        formatList([
            getRelativeIfExists(module.path, 'nodics.js'),
            getRelativeIfExists(module.path, 'package.json'),
            getRelativeIfExists(module.path, 'readme.md'),
            getRelativeIfExists(module.path, 'config/properties.js'),
            getRelativeIfExists(module.path, 'config/prescripts.js'),
            getRelativeIfExists(module.path, 'config/postscripts.js'),
            getRelativeIfExists(module.path, 'src/schemas/schemas.js'),
            getRelativeIfExists(module.path, 'src/router/router.js')
        ].filter(Boolean), 'No standard important files were found.'),
        '',
        ...createFileInventoryLines(fileInventory),
        '## Extension Contract',
        '',
        '- Treat this module as a replaceable layer in the Nodics hierarchy.',
        '- Later project/environment/server/node modules may override schemas, routers, services, facades, controllers, pipelines, interceptors, data, tests, and configuration.',
        '- Preserve source definitions as the contract. Generated artifacts must be recreated by build and cleaned by clean.',
        '- Add human-authored LLM notes only for intent, boundaries, examples, and decisions that cannot be derived from source.',
        '- Use the file inventory above to find documented, partially documented, and undocumented source contracts; an inventory entry is not proof that documentation is complete.'
    ].join('\n') + '\n';
}

function createFileInventoryLines(fileInventory) {
    const lines = [
        '## File Inventory',
        '',
        'This inventory covers every module-owned file included in the context fingerprint. Documentation status is factual: generated inventory never invents business intent for undocumented code.',
        '',
        '| File | Area | Status | Methods | Purpose | Gaps |',
        '| --- | --- | --- | ---: | --- | --- |'
    ];

    fileInventory.forEach(file => {
        lines.push('| `' + file.path + '` | `' + file.area + '` | `' + file.documentationStatus + '` | ' +
            file.documentedMethods + '/' + file.exportedMethods + ' | ' + escapeTableValue(file.purpose) + ' | ' +
            escapeTableValue(file.documentationIssues.join('; ')) + ' |');
    });
    lines.push('');
    return lines;
}

function createSchemasContext(module, schemaGroups, loadError) {
    let lines = [
        '# ' + module.name + ' Schema Context',
        '',
        '> Generated by `npm run llm:generate`. Do not edit this file directly.',
        ''
    ];

    if (loadError) {
        lines.push('Schema definitions could not be loaded from `src/schemas/schemas.js`.');
        lines.push('');
        lines.push('Error: `' + loadError.replace(/`/g, '\'') + '`');
        lines.push('');
        lines.push('The module may still be valid if schemas require runtime globals that are only available during a full Nodics startup.');
        return lines.join('\n') + '\n';
    }

    let moduleNames = Object.keys(schemaGroups || {}).sort();
    if (moduleNames.length === 0) {
        lines.push('No local schema definitions were found for this module.');
        return lines.join('\n') + '\n';
    }

    moduleNames.forEach(moduleName => {
        lines.push('## `' + moduleName + '` Schemas');
        lines.push('');
        lines.push('| Schema | Super | Model | Service | Router | Cache | Search | Event | Tenants | Properties |');
        lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: |');
        Object.keys(schemaGroups[moduleName] || {}).sort().forEach(schemaName => {
            let summary = summarizeSchema(schemaGroups[moduleName][schemaName] || {});
            lines.push('| ' + [
                '`' + schemaName + '`',
                summary.super ? '`' + summary.super + '`' : '',
                summary.model ? 'yes' : 'no',
                summary.serviceEnabled ? 'yes' : 'no',
                summary.routerEnabled ? 'yes' : 'no',
                summary.cacheEnabled ? 'yes' : 'no',
                summary.searchEnabled ? 'yes' : 'no',
                summary.eventEnabled ? 'yes' : 'no',
                summary.tenants.length ? summary.tenants.map(tenant => '`' + tenant + '`').join(', ') : '',
                String(summary.properties.length)
            ].join(' | ') + ' |');
        });
        lines.push('');

        Object.keys(schemaGroups[moduleName] || {}).sort().forEach(schemaName => {
            let summary = summarizeSchema(schemaGroups[moduleName][schemaName] || {});
            lines.push('### `' + moduleName + '.' + schemaName + '`');
            lines.push('');
            if (summary.properties.length === 0) {
                lines.push('- No direct properties defined.');
            } else {
                summary.properties.forEach(property => {
                    lines.push('- `' + property.name + '` `' + property.type + '`' +
                        (property.required ? ' required' : ' optional') +
                        (property.description ? ': ' + property.description : ''));
                });
            }
            lines.push('');
        });
    });

    return lines.join('\n') + '\n';
}

function createTestsContext(module, files) {
    let generatedTests = files.testFiles.filter(filePath => filePath.includes('/test/gen/'));
    let handAuthoredTests = files.testFiles.filter(filePath => !filePath.includes('/test/gen/'));

    return [
        '# ' + module.name + ' Test Context',
        '',
        '> Generated by `npm run llm:generate`. Do not edit this file directly.',
        '',
        '## Hand-Authored Tests',
        '',
        formatList(handAuthoredTests, 'No hand-authored tests were found.'),
        '',
        '## Generated Tests',
        '',
        formatList(generatedTests, 'No generated tests were found. Run `npm run build` when schema/router generation is expected.'),
        '',
        '## Testing Rules',
        '',
        '- Keep module-specific tests inside the owning module.',
        '- Put generated tests under `test/gen` so clean/build can remove and recreate them.',
        '- Project modules may add or override tests in a later layer when behavior intentionally differs.',
        '- Basic tests should avoid external dependency availability unless the active module explicitly owns that dependency.'
    ].join('\n') + '\n';
}

function createManifest(module, files, schemaGroups, loadError, fileInventory) {
    const documentation = summarizeFileDocumentation(fileInventory);
    return JSON.stringify({
        contextVersion: 3,
        moduleName: module.name,
        path: module.relativePath,
        kind: getModuleKind(module),
        runtime: getModuleRuntime(module),
        package: {
            index: module.index || null,
            version: module.packageJson.version || null,
            description: module.description || null
        },
        sourceFiles: files.sourceFiles.length,
        testFiles: files.testFiles.length,
        dataFiles: files.dataFiles.length,
        ownedFiles: files.ownedFiles.length,
        sourceFingerprint: files.sourceFingerprint,
        documentation: documentation,
        schemaGroups: Object.keys(schemaGroups || {}).sort().reduce((result, moduleName) => {
            result[moduleName] = Object.keys(schemaGroups[moduleName] || {}).sort();
            return result;
        }, {}),
        schemaLoadError: loadError || null,
        generatedBy: 'scripts/generate-module-llm-context.js'
    }, null, 2) + '\n';
}

function writeModuleContext(module) {
    let llmDirectory = path.join(module.path, 'llm');
    let generatedDirectory = path.join(llmDirectory, 'generated');
    ensureDirectory(generatedDirectory);

    let readmePath = path.join(llmDirectory, 'README.md');
    if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(readmePath, createReadme(module), 'utf8');
    }

    let schemaResult = loadLocalSchemas(module.path);
    let files = collectModuleFiles(module);
    let fileInventory = analyzeOwnedFiles(module, files);
    let legacyFilesContextPath = path.join(generatedDirectory, 'files.md');
    if (fs.existsSync(legacyFilesContextPath)) {
        fs.unlinkSync(legacyFilesContextPath);
    }
    fs.writeFileSync(path.join(generatedDirectory, 'module-context.md'), createModuleContext(module, files, schemaResult.schemas, fileInventory), 'utf8');
    fs.writeFileSync(path.join(generatedDirectory, 'schemas.md'), createSchemasContext(module, schemaResult.schemas, schemaResult.error), 'utf8');
    fs.writeFileSync(path.join(generatedDirectory, 'tests.md'), createTestsContext(module, files), 'utf8');
    fs.writeFileSync(path.join(generatedDirectory, 'manifest.json'), createManifest(module, files, schemaResult.schemas, schemaResult.error, fileInventory), 'utf8');
}

function run() {
    let modules = scanModules();
    bootstrapSchemaGlobals(modules);
    let contextModules = modules.filter(module => module.relativePath !== 'gSetup');
    contextModules.forEach(writeModuleContext);
    console.log('Generated module LLM context for ' + contextModules.length + ' modules');
}

if (require.main === module) {
    run();
}

module.exports = {
    run,
    writeModuleContext
};
