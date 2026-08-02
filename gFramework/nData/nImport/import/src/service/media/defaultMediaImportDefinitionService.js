/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

/**
 * @module gFramework/nData/nImport/import/src/service/media/defaultMediaImportDefinitionService
 * @description Resolves optional import templates or generic schema targets and materializes run-local header files for media-backed imports.
 * @layer service
 * @owner import
 * @override Projects may override definition lookup or header projection while preserving mediaCode input, nMedia storage authority, and nImport execution authority.
 */
module.exports = {

    /** Initializes media import definition handling. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes media import definition handling. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Prepares a media-backed local import workspace from either a selected import
     * template or a generic module/schema target.
     *
     * @param {Object} request Secured import request containing mediaCode and definitionCode.
     * @returns {Promise<Object>} Staging result with safe media and definition projections.
     */
    prepare: async function (request) {
        request = request || {};
        let definition = await this.resolveDefinition(request);
        this.validateDefinition(definition);
        let stageResult = await SERVICE.DefaultMediaImportSourceStagingService.stage(Object.assign({}, request, {
            dataFilePrefix: definition.dataFilePrefix
        }));
        this.validateMediaAgainstDefinition(stageResult.mediaSource, definition);
        let headerPath = await this.writeHeaderFile(stageResult.inputPath.rootPath, definition, request);
        return {
            inputPath: Object.assign({}, stageResult.inputPath, {
                headerPath: path.dirname(headerPath)
            }),
            outputPath: {
                rootPath: stageResult.inputPath.rootPath + '/finalized',
                dataPath: stageResult.inputPath.rootPath + '/finalized/data',
                successPath: stageResult.inputPath.rootPath + '/finalized/success',
                errorPath: stageResult.inputPath.rootPath + '/finalized/error'
            },
            mediaSource: stageResult.mediaSource,
            importDefinition: this.projectDefinition(definition),
            headerFile: {
                fileName: path.basename(headerPath)
            },
            stagedFile: stageResult.stagedFile
        };
    },

    /**
     * Resolves an active persisted import definition by code, or builds a generic
     * schema-backed definition from the request when no template is selected.
     *
     * @param {Object} request Import request.
     * @returns {Promise<Object>} Import definition model.
     */
    resolveDefinition: async function (request) {
        if (!this.hasDefinitionCode(request)) {
            return this.buildGenericDefinition(request);
        }
        let definitionCode = this.resolveDefinitionCode(request);
        if (!SERVICE.DefaultImportDefinitionService || typeof SERVICE.DefaultImportDefinitionService.get !== 'function') {
            throw new CLASSES.DataImportError('ERR_IMP_00009', 'Import definition service is unavailable');
        }
        let response = await SERVICE.DefaultImportDefinitionService.get({
            tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
            authData: request.authData,
            query: { code: definitionCode },
            options: { recursive: false },
            searchOptions: { pageSize: 2, pageNumber: 1 }
        });
        let values = (response && Array.isArray(response.result) ? response.result : [])
            .filter(value => value && value.code === definitionCode && value.active !== false && value.enabled !== false);
        if (values.length !== 1) {
            throw new CLASSES.DataImportError('ERR_IMP_00009', 'Active import definition was not found: ' + definitionCode);
        }
        return values[0];
    },

    /**
     * Checks whether the request selected an optional import template.
     *
     * @param {Object} request Import request.
     * @returns {boolean} True when an import definition code exists.
     */
    hasDefinitionCode: function (request) {
        let source = request.source || request.mediaSource || {};
        return [request.definitionCode, request.importDefinitionCode, source.definitionCode]
            .some(value => typeof value === 'string' && value.trim() !== '');
    },

    /**
     * Resolves the selected import definition code from supported request shapes.
     *
     * @param {Object} request Import request.
     * @returns {string} Definition code.
     */
    resolveDefinitionCode: function (request) {
        let source = request.source || request.mediaSource || {};
        let definitionCode = [request.definitionCode, request.importDefinitionCode, source.definitionCode]
            .find(value => typeof value === 'string' && value.trim() !== '');
        if (!definitionCode || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(String(definitionCode).trim())) {
            throw new CLASSES.DataImportError('ERR_IMP_00009', 'Invalid import definition code');
        }
        return String(definitionCode).trim();
    },

    /**
     * Builds a generic import definition from a selected target schema. This is the
     * default Axis file-import path; persisted templates remain optional.
     *
     * @param {Object} request Import request.
     * @returns {Object} Runtime-only import definition.
     */
    buildGenericDefinition: function (request) {
        let moduleName = this.safeSegment(request.moduleName, 'Invalid import target module');
        let schemaName = request.schemaName ? this.safeSegment(request.schemaName, 'Invalid import target schema') : undefined;
        let indexName = request.indexName ? this.safeSegment(request.indexName, 'Invalid import target index') : undefined;
        if (!schemaName && !indexName) {
            throw new CLASSES.DataImportError('ERR_IMP_00009', 'Import target schema or index is required');
        }
        let targetName = schemaName || indexName;
        let operation = request.operation ? this.safeSegment(request.operation, 'Invalid import operation') : (schemaName ? 'saveAll' : undefined);
        return {
            code: 'generic_' + moduleName + '_' + targetName,
            description: 'Generic media import for ' + moduleName + '/' + targetName,
            enabled: true,
            active: true,
            moduleName: moduleName,
            schemaName: schemaName,
            indexName: indexName,
            operation: operation,
            tenants: [request.tenant || CONFIG.get('defaultTenant') || 'default'],
            dataFilePrefix: request.dataFilePrefix ? this.safeSegment(request.dataFilePrefix, 'Invalid data file prefix') : this.defaultDataFilePrefix(targetName),
            query: request.query || this.defaultQuery(),
            allowedExtensions: []
        };
    },

    /**
     * Validates the definition has the minimum existing Nodics header contract.
     *
     * @param {Object} definition Persisted import definition.
     * @returns {boolean} True when valid.
     */
    validateDefinition: function (definition) {
        if (!definition || definition.enabled === false || definition.active === false) {
            throw new CLASSES.DataImportError('ERR_IMP_00009', 'Import definition is not active');
        }
        if (!definition.moduleName || !definition.dataFilePrefix) {
            throw new CLASSES.DataImportError('ERR_IMP_00009', 'Import definition is missing module or data-file prefix');
        }
        if (!definition.schemaName && !definition.indexName) {
            throw new CLASSES.DataImportError('ERR_IMP_00009', 'Import definition requires schemaName or indexName');
        }
        return true;
    },

    /**
     * Validates a request-provided module, schema, index, operation, or file prefix
     * segment before it becomes part of a generated header.
     *
     * @param {string} value Raw segment.
     * @param {string} message Error message.
     * @returns {string} Safe segment.
     */
    safeSegment: function (value, message) {
        if (!value || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(String(value))) {
            throw new CLASSES.DataImportError('ERR_IMP_00009', message);
        }
        return String(value);
    },

    /**
     * Returns the default import query used by schema-backed generic imports.
     *
     * @returns {Object} Query mapping.
     */
    defaultQuery: function () {
        return { code: '$code' };
    },

    /**
     * Returns the standard data-file prefix for a generic schema target.
     *
     * @param {string} targetName Schema or index name.
     * @returns {string} Data file prefix.
     */
    defaultDataFilePrefix: function (targetName) {
        return String(targetName).replace(/^[A-Z]/, value => value.toLowerCase()) + 'ImportData';
    },

    /**
     * Validates selected media file extension against definition policy when configured.
     *
     * @param {Object} mediaSource Safe media source projection.
     * @param {Object} definition Import definition.
     * @returns {boolean} True when valid.
     */
    validateMediaAgainstDefinition: function (mediaSource, definition) {
        let allowed = [].concat(definition.allowedExtensions || []).filter(Boolean).map(value => String(value).replace(/^\./, '').toLowerCase());
        if (allowed.length === 0) {
            return true;
        }
        let extension = String(mediaSource.extension || path.extname(mediaSource.fileName || '').replace(/^\./, '')).toLowerCase();
        if (!allowed.includes(extension)) {
            throw new CLASSES.DataImportError('ERR_IMP_00009', 'Media file extension is not allowed by selected import definition');
        }
        return true;
    },

    /**
     * Writes a run-local header file from the selected import definition.
     *
     * @param {string} rootPath Import run root path.
     * @param {Object} definition Import definition.
     * @param {Object} request Import request.
     * @returns {Promise<string>} Header file path.
     */
    writeHeaderFile: async function (rootPath, definition, request) {
        let headersPath = path.join(rootPath, 'headers');
        await fse.ensureDir(headersPath);
        let headerName = this.safeName(definition.code) + 'Header';
        let headerFile = path.join(headersPath, headerName + '.js');
        let headerPayload = {};
        headerPayload[definition.moduleName] = {};
        headerPayload[definition.moduleName][definition.code] = this.buildHeader(definition, request);
        let content = [
            '/* Runtime-generated import header. Source authority: nImport media import request. */',
            'module.exports = ' + this.serialize(headerPayload) + ';',
            ''
        ].join('\n');
        fs.writeFileSync(headerFile, content, 'utf8');
        return headerFile;
    },

    /**
     * Builds a standard Nodics import header object from a definition.
     *
     * @param {Object} definition Import definition.
     * @param {Object} request Import request.
     * @returns {Object} Header contract.
     */
    buildHeader: function (definition, request) {
        let options = Object.assign({}, definition.options || {}, {
            enabled: definition.enabled !== false,
            moduleName: definition.moduleName,
            schemaName: definition.schemaName,
            indexName: definition.indexName,
            operation: definition.operation || (definition.schemaName ? 'saveAll' : undefined),
            tenants: this.resolveTenants(definition, request),
            dataFilePrefix: definition.dataFilePrefix,
            finalizeData: true
        });
        if (!options.indexName) {
            delete options.indexName;
        }
        if (!options.schemaName) {
            delete options.schemaName;
        }
        let header = {
            options: options,
            query: definition.query || {}
        };
        if (definition.macros) {
            header.macros = definition.macros;
        }
        return header;
    },

    /**
     * Resolves the narrowest tenant scope allowed by definition and request.
     *
     * @param {Object} definition Import definition.
     * @param {Object} request Import request.
     * @returns {string[]} Tenant codes.
     */
    resolveTenants: function (definition, request) {
        let configured = [].concat(definition.tenants || []).filter(Boolean);
        let tenant = request.tenant || CONFIG.get('defaultTenant') || 'default';
        if (configured.length === 0) {
            return [tenant];
        }
        if (!configured.includes(tenant)) {
            throw new CLASSES.DataImportError('ERR_IMP_00009', 'Requested tenant is outside selected import definition scope');
        }
        return [tenant];
    },

    /**
     * Returns a client-safe definition projection.
     *
     * @param {Object} definition Import definition.
     * @returns {Object} Safe projection.
     */
    projectDefinition: function (definition) {
        return {
            code: definition.code,
            description: definition.description,
            moduleName: definition.moduleName,
            schemaName: definition.schemaName,
            indexName: definition.indexName,
            operation: definition.operation || (definition.schemaName ? 'saveAll' : undefined),
            dataFilePrefix: definition.dataFilePrefix,
            allowedExtensions: [].concat(definition.allowedExtensions || [])
        };
    },

    /**
     * Produces a safe JavaScript identifier/file segment from an import code.
     *
     * @param {string} value Raw code.
     * @returns {string} Safe name.
     */
    safeName: function (value) {
        return String(value || 'mediaImport').replace(/[^a-zA-Z0-9_$]/g, '_');
    },

    /**
     * Serializes plain definition data into a runtime-generated header file.
     *
     * @param {Object} value Header payload.
     * @returns {string} JavaScript object literal.
     */
    serialize: function (value) {
        return JSON.stringify(value, null, 4);
    }
};
