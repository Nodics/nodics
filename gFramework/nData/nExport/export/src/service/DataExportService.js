/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nExport/export/src/service/DataExportService
 * @description Implements nExport source read, transformation, rendering, and generated-media creation behavior.
 * @layer service
 * @owner nExport
 * @override Project modules may override export behavior through later active modules while preserving nMedia-owned media lookup, access policy, and download delivery.
 */
module.exports = {

    /**
     * Initializes the data export service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the data export service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Executes a governed schema export through existing read contracts and
     * nMedia-owned generated-file storage.
     *
     * @param {Object} request Export request.
     * @returns {Promise<Object>} Export media and execution summary.
     */
    export: async function (request) {
        let payload = this.normalizeRequest(request);
        let descriptor = await this.resolveSchemaDescriptor(request, payload);
        let records = await this.collectRecords(request, payload, descriptor);
        let schemaModel = this.resolveSchemaModel(request, payload);
        let exportRecords = await this.applyExportAccessPolicies(Object.assign({}, request, {
            moduleName: payload.moduleName,
            schemaModel: schemaModel
        }), records);
        let rendered = this.render(payload, exportRecords, descriptor);
        let media = await this.storeMedia(request, payload, rendered);
        return {
            code: 'SUC_SYS_00000',
            data: {
                moduleName: payload.moduleName,
                schemaName: payload.schemaName,
                format: payload.format,
                fileName: rendered.fileName,
                media: media,
                summary: {
                    requestedRecords: records.length,
                    exportedRecords: exportRecords.length,
                    totalAvailableRecords: records.totalCount || exportRecords.length,
                    truncated: records.truncated === true
                }
            }
        };
    },

    /**
     * Normalizes and validates the browser-safe export request.
     *
     * @param {Object} request Runtime request.
     * @returns {Object} Bounded export payload.
     */
    normalizeRequest: function (request) {
        let config = this.getConfiguration();
        if (config.enabled === false) {
            throw new CLASSES.NodicsError('ERR_SYS_00003', 'Data export is disabled by configuration');
        }
        let body = request && request.export || {};
        let moduleName = this.safeCode(body.moduleName, 'Export module');
        let schemaName = this.safeCode(body.schemaName, 'Export schema');
        let format = String(body.format || config.defaultFormat || 'csv').trim().toLowerCase();
        if (!config.allowedFormats.includes(format)) {
            throw new CLASSES.NodicsError('ERR_SYS_00003', 'Requested export file type is not supported');
        }
        let query = body.query && typeof body.query === 'object' && !Array.isArray(body.query) ?
            body.query : {};
        let pageSize = Number(config.pageSize || 50);
        if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = 50;
        let maximumRecords = Number(config.maximumRecords || 1000);
        if (!Number.isInteger(maximumRecords) || maximumRecords < 1) maximumRecords = 1000;
        return {
            moduleName: moduleName,
            schemaName: schemaName,
            enterpriseCode: this.safeOptionalCode(body.enterpriseCode) ||
                this.resolveEnterpriseCode(request),
            format: format,
            query: {
                search: typeof query.search === 'string' ? query.search : '',
                filters: query.filters,
                sort: query.sort
            },
            pageSize: pageSize,
            maximumRecords: maximumRecords
        };
    },

    /**
     * Resolves the active data export configuration.
     *
     * @returns {Object} Export configuration.
     */
    getConfiguration: function () {
        return Object.assign({
            enabled: true,
            allowedFormats: ['csv', 'json'],
            defaultFormat: 'csv',
            maximumRecords: 1000,
            pageSize: 50,
            media: {
                folderCode: 'exportFiles',
                formatCode: 'exportFile'
            }
        }, CONFIG && CONFIG.get ? (CONFIG.get('dataExport') || {}) : {});
    },

    /**
     * Resolves a client-safe schema descriptor from Schema Workbench.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Normalized export payload.
     * @returns {Promise<Object>} Workbench schema descriptor.
     */
    resolveSchemaDescriptor: async function (request, payload) {
        if (!SERVICE.DefaultSchemaWorkbenchService ||
            typeof SERVICE.DefaultSchemaWorkbenchService.get !== 'function') {
            throw new CLASSES.NodicsError('ERR_SYS_00003',
                'Schema Workbench service is required for governed exports');
        }
        let response = await SERVICE.DefaultSchemaWorkbenchService.get(
            this.buildWorkbenchRequest(request, payload, {})
        );
        return response.data || response.result || response;
    },

    /**
     * Collects bounded records by reusing Schema Workbench search semantics.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Normalized export payload.
     * @param {Object} descriptor Schema descriptor.
     * @returns {Promise<Object[]>} Export candidate records.
     */
    collectRecords: async function (request, payload, descriptor) {
        if (!SERVICE.DefaultSchemaWorkbenchService ||
            typeof SERVICE.DefaultSchemaWorkbenchService.search !== 'function') {
            throw new CLASSES.NodicsError('ERR_SYS_00003',
                'Schema Workbench search is required for governed exports');
        }
        let records = [];
        let totalCount = 0;
        let pageNumber = 1;
        let pageSize = this.resolvePageSize(payload.pageSize, descriptor);
        while (records.length < payload.maximumRecords) {
            let response = await SERVICE.DefaultSchemaWorkbenchService.search(
                this.buildWorkbenchRequest(request, payload, Object.assign({}, payload.query, {
                    pageNumber: pageNumber,
                    pageSize: pageSize
                }))
            );
            let page = response.data || response.result || {};
            let pageRecords = Array.isArray(page.records) ? page.records : [];
            totalCount = Number(page.totalCount || totalCount || pageRecords.length);
            records = records.concat(pageRecords);
            if (pageRecords.length < pageSize || records.length >= totalCount) break;
            pageNumber += 1;
        }
        records = records.slice(0, payload.maximumRecords);
        records.totalCount = totalCount;
        records.truncated = totalCount > records.length;
        return records;
    },

    /**
     * Builds a module-scoped Workbench request without changing caller auth.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Normalized export payload.
     * @param {Object} body Workbench body.
     * @returns {Object} Workbench request.
     */
    buildWorkbenchRequest: function (request, payload, body) {
        return Object.assign({}, request, {
            moduleName: payload.moduleName,
            httpRequest: {
                params: {
                    schema: payload.schemaName
                },
                body: body || {}
            }
        });
    },

    /**
     * Resolves a page size allowed by the schema descriptor.
     *
     * @param {number} configuredPageSize Configured export page size.
     * @param {Object} descriptor Workbench descriptor.
     * @returns {number} Allowed page size.
     */
    resolvePageSize: function (configuredPageSize, descriptor) {
        let capabilities = descriptor && descriptor.queryCapabilities || {};
        let allowed = Array.isArray(capabilities.allowedPageSizes) ?
            capabilities.allowedPageSizes.slice().sort((left, right) => right - left) : [50, 25, 10];
        return allowed.find(size => size <= configuredPageSize) ||
            capabilities.defaultPageSize || 25;
    },

    /**
     * Resolves the schema model used by export access policy filtering.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Normalized export payload.
     * @returns {Object} Runtime schema model descriptor.
     */
    resolveSchemaModel: function (request, payload) {
        let modelName = UTILS && typeof UTILS.createModelName === 'function' ?
            UTILS.createModelName(payload.schemaName) :
            payload.schemaName.charAt(0).toUpperCase() + payload.schemaName.slice(1);
        let models = NODICS && typeof NODICS.getModels === 'function' ?
            NODICS.getModels(payload.moduleName, request.tenant) : undefined;
        return models && models[modelName] || {
            schemaName: payload.schemaName,
            moduleName: payload.moduleName
        };
    },

    /**
     * Renders export-safe records into a generated file buffer.
     *
     * @param {Object} payload Normalized payload.
     * @param {Object[]} records Export-safe records.
     * @param {Object} descriptor Schema descriptor.
     * @returns {Object} Rendered file descriptor.
     */
    render: function (payload, records, descriptor) {
        let extension = payload.format;
        let mimeType = payload.format === 'json' ? 'application/json' : 'text/csv';
        let fileName = [
            payload.schemaName,
            'export',
            new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14)
        ].join('-') + '.' + extension;
        let content = payload.format === 'json' ?
            this.renderJson(payload, records, descriptor) :
            this.renderCsv(records, descriptor);
        return {
            fileName: fileName,
            originalFileName: fileName,
            mimeType: mimeType,
            extension: extension,
            buffer: Buffer.from(content, 'utf8')
        };
    },

    /**
     * Renders records as JSON with bounded metadata.
     *
     * @param {Object} payload Normalized payload.
     * @param {Object[]} records Export records.
     * @param {Object} descriptor Schema descriptor.
     * @returns {string} JSON content.
     */
    renderJson: function (payload, records, descriptor) {
        return JSON.stringify({
            exportedAt: new Date().toISOString(),
            moduleName: payload.moduleName,
            schemaName: payload.schemaName,
            label: descriptor.label,
            records: records
        }, null, 2);
    },

    /**
     * Renders records as CSV using descriptor display fields first.
     *
     * @param {Object[]} records Export records.
     * @param {Object} descriptor Schema descriptor.
     * @returns {string} CSV content.
     */
    renderCsv: function (records, descriptor) {
        let fields = this.resolveCsvFields(records, descriptor);
        let lines = [fields.map(this.escapeCsvValue).join(',')];
        records.forEach(record => {
            lines.push(fields.map(field => this.escapeCsvValue(this.readPath(record, field))).join(','));
        });
        return lines.join('\n') + '\n';
    },

    /**
     * Resolves CSV columns from schema fields and observed scalar values.
     *
     * @param {Object[]} records Export records.
     * @param {Object} descriptor Schema descriptor.
     * @returns {string[]} CSV field names.
     */
    resolveCsvFields: function (records, descriptor) {
        let descriptorFields = (descriptor.fields || [])
            .filter(field => !['array', 'object'].includes(field.type))
            .map(field => field.name);
        let observed = [];
        records.forEach(record => {
            Object.keys(record || {}).forEach(key => {
                if (!observed.includes(key) &&
                    !['object', 'function', 'undefined'].includes(typeof record[key]) &&
                    !Array.isArray(record[key])) {
                    observed.push(key);
                }
            });
        });
        return Array.from(new Set(descriptorFields.concat(observed)));
    },

    /**
     * Reads a simple field from a record.
     *
     * @param {Object} record Record.
     * @param {string} field Field name.
     * @returns {*} Value.
     */
    readPath: function (record, field) {
        return record ? record[field] : undefined;
    },

    /**
     * Escapes a CSV cell value.
     *
     * @param {*} value Source value.
     * @returns {string} CSV-safe value.
     */
    escapeCsvValue: function (value) {
        if (value === undefined || value === null) return '';
        let text = value instanceof Date ? value.toISOString() : String(value);
        return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
    },

    /**
     * Stores the generated file through nMedia.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Export payload.
     * @param {Object} rendered Rendered file descriptor.
     * @returns {Promise<Object>} Stored media model.
     */
    storeMedia: async function (request, payload, rendered) {
        if (!SERVICE.DefaultMediaUploadService ||
            typeof SERVICE.DefaultMediaUploadService.upload !== 'function') {
            throw new CLASSES.NodicsError('ERR_SYS_00003',
                'nMedia upload service is required for generated exports');
        }
        let config = this.getConfiguration();
        let mediaConfig = config.media || {};
        return SERVICE.DefaultMediaUploadService.upload({
            tenant: request.tenant,
            authData: request.authData,
            enterpriseCode: payload.enterpriseCode,
            moduleName: payload.moduleName,
            schemaName: payload.schemaName,
            folderCode: mediaConfig.folderCode || 'exportFiles',
            formatCode: mediaConfig.formatCode || 'exportFile',
            name: rendered.originalFileName,
            description: 'Generated ' + payload.schemaName + ' ' + payload.format + ' export',
            files: [{
                fieldName: 'file',
                originalFileName: rendered.originalFileName,
                fileName: rendered.fileName,
                mimeType: rendered.mimeType,
                sizeBytes: rendered.buffer.length,
                buffer: rendered.buffer
            }]
        });
    },

    /**
     * Resolves the effective enterprise code for export path ownership.
     *
     * @param {Object} request Runtime request.
     * @returns {string} Enterprise code.
     */
    resolveEnterpriseCode: function (request) {
        return request.enterpriseCode ||
            request.authData && request.authData.enterprise && request.authData.enterprise.code ||
            request.headers && request.headers['x-enterprise-code'] ||
            request.httpRequest && request.httpRequest.headers &&
            request.httpRequest.headers['x-enterprise-code'] ||
            'default';
    },

    /**
     * Validates a required module/schema style code.
     *
     * @param {*} value Value.
     * @param {string} label Error label.
     * @returns {string} Safe code.
     */
    safeCode: function (value, label) {
        if (typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(value.trim())) {
            throw new CLASSES.NodicsError('ERR_SYS_00003', label + ' is invalid');
        }
        return value.trim();
    },

    /**
     * Validates an optional code.
     *
     * @param {*} value Value.
     * @returns {string|undefined} Safe code.
     */
    safeOptionalCode: function (value) {
        if (value === undefined || value === null || value === '') return undefined;
        return this.safeCode(value, 'Export enterprise');
    },

    /**
     * Applies schema/property export access policies to exported models.
     *
     * @param {Object} request Export request with schemaModel and authData.
     * @param {Object[]} models Models selected for export.
     * @returns {Promise<Object[]>} Export-safe models.
     */
    applyExportAccessPolicies: function (request, models) {
        let exportModels = this.cloneModels(models || []);
        if (!SERVICE.DefaultSchemaReadAccessPolicyService ||
            typeof SERVICE.DefaultSchemaReadAccessPolicyService.applyExportPolicies !== 'function') {
            return Promise.resolve(exportModels);
        }
        return SERVICE.DefaultSchemaReadAccessPolicyService.applyExportPolicies(request, {
            success: {
                result: exportModels
            }
        }).then(response => {
            return response.success.result;
        });
    },

    /**
     * Creates export-safe model copies before policy filtering and rendering.
     *
     * @param {Object[]} models Source models selected for export.
     * @returns {Object[]} Plain model copies that export policies may mutate safely.
     */
    cloneModels: function (models) {
        return [].concat(models || []).map(model => {
            if (model && typeof model.toObject === 'function') {
                return model.toObject();
            }
            if (model && typeof model.toJSON === 'function') {
                return model.toJSON();
            }
            return Object.assign({}, model);
        });
    },

    /**
     * Extracts model arrays from standard Nodics service responses.
     *
     * @param {Object} response Service response.
     * @returns {Object[]} Response items.
     */
    items: function (response) {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.result)) return response.result;
        if (response.success && Array.isArray(response.success.result)) return response.success.result;
        if (response.data && Array.isArray(response.data.result)) return response.data.result;
        if (response.data && Array.isArray(response.data.records)) return response.data.records;
        return [];
    }
};
