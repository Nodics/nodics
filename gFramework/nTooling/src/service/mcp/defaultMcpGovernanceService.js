/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/service/mcp/defaultMcpGovernanceService
 * @description Builds the read-only governance payload that a future Nodics MCP adapter can expose without becoming a second source of architecture, configuration, or runtime truth.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling may wrap this service for transport-specific MCP servers, but source-of-truth discovery, module ownership, AGENTS lookup, and change-impact guidance must remain read-only.
 */
const fs = require('fs');
const path = require('path');

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

module.exports = {
    /**
     * Converts a file path to slash-separated form for stable reports.
     * @param {string} filePath File path to normalize.
     * @returns {string} Slash-separated path.
     */
    toPosix: function (filePath) {
        return filePath.split(path.sep).join('/');
    },

    /**
     * Creates a repository-relative report path.
     * @param {string} home Repository home.
     * @param {string} filePath Absolute file path.
     * @returns {string} Repository-relative path.
     */
    toRelative: function (home, filePath) {
        return this.toPosix(path.relative(home, filePath));
    },

    /**
     * Reads JSON from disk when the file exists.
     * @param {string} filePath JSON file path.
     * @returns {Object|null} Parsed JSON or null.
     */
    readJsonIfExists: function (filePath) {
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    },

    /**
     * Resolves a user supplied path inside the selected home.
     * @param {string} home Repository home.
     * @param {string} inputPath User supplied absolute or relative path.
     * @returns {string} Absolute path inside home.
     */
    resolveInsideHome: function (home, inputPath) {
        const resolved = path.resolve(home, inputPath || '.');
        const relative = path.relative(home, resolved);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            throw new Error('MCP governance lookup path must stay inside the selected Nodics home: ' + inputPath);
        }
        return resolved;
    },

    /**
     * Checks whether a directory is a Nodics module directory.
     * @param {string} directory Candidate directory.
     * @returns {boolean} Whether the directory has package and lifecycle files.
     */
    isModuleDirectory: function (directory) {
        return fs.existsSync(path.join(directory, 'package.json')) &&
            fs.existsSync(path.join(directory, 'nodics.js'));
    },

    /**
     * Recursively discovers module-shaped packages without loading runtime code.
     * @param {string} home Repository home.
     * @param {string} directory Directory to scan.
     * @param {Object[]} modules Mutable module collection.
     * @returns {Object[]} Discovered modules.
     */
    discoverModules: function (home, directory, modules = []) {
        if (!fs.existsSync(directory)) {
            return modules;
        }
        if (directory !== home && this.isModuleDirectory(directory)) {
            const packageJson = this.readJsonIfExists(path.join(directory, 'package.json')) || {};
            const nodics = packageJson.nodics || {};
            modules.push({
                name: packageJson.name || path.basename(directory),
                description: packageJson.description || '',
                index: packageJson.index || '0',
                kind: nodics.kind || 'unspecified',
                runtimeModule: packageJson.runtimeModule !== false && nodics.runtimeModule !== false,
                path: directory,
                relativePath: this.toRelative(home, directory),
                owns: nodics.owns || [],
                runtime: nodics.runtime || {},
                entrypoints: nodics.entrypoints || {}
            });
        }
        fs.readdirSync(directory, { withFileTypes: true })
            .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && !ignoredDirectories.has(entry.name))
            .sort((left, right) => left.name.localeCompare(right.name))
            .forEach(entry => this.discoverModules(home, path.join(directory, entry.name), modules));
        return modules;
    },

    /**
     * Creates a concise summary of the selected workspace.
     * @param {string} home Repository home.
     * @param {Object[]} modules Discovered modules.
     * @returns {Object} Workspace summary.
     */
    summarizeWorkspace: function (home, modules) {
        const byKind = {};
        modules.forEach(moduleObject => {
            byKind[moduleObject.kind] = (byKind[moduleObject.kind] || 0) + 1;
        });
        return {
            home: home,
            moduleCount: modules.length,
            runtimeModuleCount: modules.filter(moduleObject => moduleObject.runtimeModule).length,
            nonRuntimeModuleCount: modules.filter(moduleObject => !moduleObject.runtimeModule).length,
            byKind: byKind,
            sourceOfTruthContracts: [
                'AGENTS.md',
                'gSetup/llm/README.md',
                'gSetup/llm/contracts/nodics-principles.md',
                'gSetup/llm/contracts/developer-implementation-contract.md',
                'gSetup/llm/contracts/module-structure-contract.md',
                'gSetup/llm/module-generation-guide.md'
            ].filter(relativePath => fs.existsSync(path.join(home, relativePath)))
        };
    },

    /**
     * Finds the module that owns or most closely contains a target path.
     * @param {Object[]} modules Discovered modules.
     * @param {string} targetPath Absolute target path.
     * @returns {Object|null} Owning module or null.
     */
    findOwningModule: function (modules, targetPath) {
        const candidates = modules
            .filter(moduleObject => {
                const relative = path.relative(moduleObject.path, targetPath);
                return !relative.startsWith('..') && !path.isAbsolute(relative);
            })
            .sort((left, right) => right.path.length - left.path.length);
        return candidates[0] || null;
    },

    /**
     * Finds the nearest AGENTS.md chain for a target path.
     * @param {string} home Repository home.
     * @param {string} targetPath Absolute target path.
     * @returns {Object[]} AGENTS files from nearest directory toward root.
     */
    findAgentsChain: function (home, targetPath) {
        const startDirectory = fs.existsSync(targetPath) && fs.statSync(targetPath).isFile() ?
            path.dirname(targetPath) : targetPath;
        const agents = [];
        let cursor = startDirectory;
        while (true) {
            const agentsPath = path.join(cursor, 'AGENTS.md');
            if (fs.existsSync(agentsPath)) {
                agents.push({
                    path: this.toRelative(home, agentsPath),
                    directory: this.toRelative(home, cursor),
                    nearest: agents.length === 0
                });
            }
            if (cursor === home) {
                break;
            }
            const parent = path.dirname(cursor);
            if (parent === cursor || path.relative(home, parent).startsWith('..')) {
                break;
            }
            cursor = parent;
        }
        return agents;
    },

    /**
     * Locates generated LLM context for a module.
     * @param {string} home Repository home.
     * @param {Object} moduleObject Discovered module.
     * @returns {Object} Generated-context location and manifest summary.
     */
    getGeneratedContext: function (home, moduleObject) {
        if (!moduleObject) {
            return null;
        }
        const contextPath = path.join(moduleObject.path, 'llm', 'generated', 'module-context.md');
        const manifestPath = path.join(moduleObject.path, 'llm', 'generated', 'manifest.json');
        const manifest = this.readJsonIfExists(manifestPath);
        return {
            module: moduleObject.name,
            modulePath: moduleObject.relativePath,
            contextPath: fs.existsSync(contextPath) ? this.toRelative(home, contextPath) : null,
            manifestPath: manifest ? this.toRelative(home, manifestPath) : null,
            contextVersion: manifest && manifest.contextVersion,
            ownedFiles: manifest && manifest.ownedFiles,
            documentation: manifest && manifest.documentation
        };
    },

    /**
     * Classifies a path into Nodics artifact types for guidance.
     * @param {string} relativePath Repository-relative path.
     * @returns {string[]} Artifact classifications.
     */
    classifyArtifact: function (relativePath) {
        const classes = [];
        if (/(^|\/)package\.json$/.test(relativePath)) {
            classes.push('module metadata');
        }
        if (/(^|\/)AGENTS\.md$/.test(relativePath) || /(^|\/)README\.md$/.test(relativePath) || /(^|\/)llm\//.test(relativePath)) {
            classes.push('documentation and AI guidance');
        }
        if (/\/config\/properties\.js$/.test(relativePath)) {
            classes.push('layered properties');
        }
        if (/\/config\/(prescripts|postscripts)\.js$/.test(relativePath)) {
            classes.push('startup extension script');
        }
        if (/\/src\/schemas\//.test(relativePath)) {
            classes.push('schema definition');
        }
        if (/\/src\/router\//.test(relativePath)) {
            classes.push('router definition');
        }
        if (/\/src\/service\//.test(relativePath)) {
            classes.push('service behavior');
        }
        if (/\/src\/(controller|facade)\//.test(relativePath)) {
            classes.push('API layer');
        }
        if (/\/src\/(pipelines|interceptors|event)\//.test(relativePath)) {
            classes.push('pipeline or event extension');
        }
        if (/\/data\//.test(relativePath)) {
            classes.push('module-owned data');
        }
        if (/\/test\//.test(relativePath)) {
            classes.push('test coverage');
        }
        if (/\/generated\//.test(relativePath) || /\/gen\//.test(relativePath)) {
            classes.push('generated artifact');
        }
        return classes.length ? classes : ['source or support file'];
    },

    /**
     * Builds change-impact guidance for a set of paths.
     * @param {string} home Repository home.
     * @param {Object[]} modules Discovered modules.
     * @param {string[]} paths Candidate changed paths.
     * @returns {Object[]} Change-impact entries.
     */
    buildChangeImpact: function (home, modules, paths) {
        return (paths || []).map(inputPath => {
            const absolutePath = this.resolveInsideHome(home, inputPath);
            const moduleObject = this.findOwningModule(modules, absolutePath);
            const relativePath = this.toRelative(home, absolutePath);
            return {
                path: relativePath,
                owningModule: moduleObject && moduleObject.name,
                owningModulePath: moduleObject && moduleObject.relativePath,
                artifactTypes: this.classifyArtifact(relativePath),
                nearestAgents: this.findAgentsChain(home, absolutePath),
                generatedContext: this.getGeneratedContext(home, moduleObject),
                guidance: [
                    'Confirm behavior from source-of-truth artifacts before implementing.',
                    'Use the owning module and the smallest valid extension point.',
                    'Do not mutate generated artifacts directly; regenerate from source definitions.',
                    'Keep security, validation, audit, rollback, diagnostics, tenant behavior, and tests aligned.'
                ]
            };
        });
    },

    /**
     * Creates the read-only governance report for MCP Phase 1.
     * @param {Object} options Report options.
     * @returns {Object} Governance report.
     */
    createReport: function (options = {}) {
        const home = path.resolve(options.home || process.env.NODICS_HOME || process.cwd());
        const modules = this.discoverModules(home, home, [])
            .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
        const targetPath = this.resolveInsideHome(home, options.path || '.');
        const owningModule = this.findOwningModule(modules, targetPath);
        return {
            contract: 'Nodics MCP Phase 1 read-only governance',
            readOnly: true,
            sourceOfTruth: 'Nodics source, metadata, AGENTS.md, LLM contracts, generated module context, and tests remain authoritative.',
            forbidden: [
                'Do not persist architecture or configuration inside MCP.',
                'Do not mutate source, generated artifacts, runtime configuration, data, or external systems.',
                'Do not replace Nodics validation, governance, or active-module resolution.'
            ],
            workspace: this.summarizeWorkspace(home, modules),
            modules: modules.map(moduleObject => ({
                name: moduleObject.name,
                kind: moduleObject.kind,
                index: moduleObject.index,
                runtimeModule: moduleObject.runtimeModule,
                path: moduleObject.relativePath,
                description: moduleObject.description,
                owns: moduleObject.owns
            })),
            lookup: {
                path: this.toRelative(home, targetPath),
                owningModule: owningModule && owningModule.name,
                owningModulePath: owningModule && owningModule.relativePath,
                nearestAgents: this.findAgentsChain(home, targetPath),
                generatedContext: this.getGeneratedContext(home, owningModule)
            },
            changeImpact: this.buildChangeImpact(home, modules, options.changePaths || [])
        };
    }
};
