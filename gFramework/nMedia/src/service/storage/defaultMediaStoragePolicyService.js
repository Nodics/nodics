/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const path = require('path');

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaStoragePolicyService
 * @description Resolves and validates backend-owned media storage policy.
 * @layer service
 * @owner nMedia
 * @override Later active modules may override policy behavior while preserving provider-neutral media ownership.
 */
module.exports = {

    /** Initializes the media storage policy service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media storage policy service. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Returns the effective media configuration.
     *
     * @returns {Object} Effective media configuration.
     */
    getConfiguration: function () {
        return typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('media') || {}) : {};
    },

    /**
     * Returns the folder policy for a caller-supplied folder code.
     *
     * @param {string} folderCode Folder code requested by caller.
     * @returns {Object} Folder policy.
     */
    getFolderPolicy: function (folderCode) {
        let configuration = this.getConfiguration();
        let folders = configuration.folders || {};
        let effectiveFolderCode = folderCode || 'default';
        let folder = folders[effectiveFolderCode] || folders.default;
        if (!folder) {
            throw new CLASSES.NodicsError('ERR_MED_00003', 'Invalid media folder');
        }
        let policy = Object.assign({}, folder, { code: folder.code || effectiveFolderCode, status: folder.status || 'ACTIVE' });
        if (policy.status !== 'ACTIVE') {
            throw new CLASSES.NodicsError('ERR_MED_00003', 'Inactive media folder');
        }
        return policy;
    },

    /**
     * Returns a folder policy without applying active-upload eligibility.
     *
     * @param {string} folderCode Folder code.
     * @returns {Object|undefined} Existing folder policy.
     */
    getConfiguredFolderPolicy: function (folderCode) {
        let configuration = this.getConfiguration();
        let folders = configuration.folders || {};
        let folder = folders[folderCode];
        return folder ? Object.assign({}, folder, { code: folder.code || folderCode, status: folder.status || 'ACTIVE' }) : undefined;
    },

    /**
     * Returns the upload/variant format policy for a caller-supplied format code.
     *
     * @param {string} formatCode Format code requested by caller.
     * @returns {Object} Format policy.
     */
    getFormatPolicy: function (formatCode) {
        let configuration = this.getConfiguration();
        let formats = configuration.formats || {};
        let effectiveFormatCode = formatCode || 'original';
        let format = formats[effectiveFormatCode];
        if (!format) {
            throw new CLASSES.NodicsError('ERR_MED_00010', 'Invalid media format');
        }
        let policy = Object.assign({}, format, { code: format.code || effectiveFormatCode, status: format.status || 'ACTIVE' });
        if (policy.status !== 'ACTIVE') {
            throw new CLASSES.NodicsError('ERR_MED_00010', 'Inactive media format');
        }
        return policy;
    },

    /**
     * Returns a format policy without applying active-upload eligibility.
     *
     * @param {string} formatCode Format code.
     * @returns {Object|undefined} Existing format policy.
     */
    getConfiguredFormatPolicy: function (formatCode) {
        let configuration = this.getConfiguration();
        let formats = configuration.formats || {};
        let format = formats[formatCode];
        return format ? Object.assign({}, format, { code: format.code || formatCode, status: format.status || 'ACTIVE' }) : undefined;
    },

    /**
     * Creates or updates one effective media folder policy in runtime configuration.
     *
     * @param {Object} request Folder policy mutation request.
     * @returns {Object} Safe folder policy projection.
     */
    saveFolderPolicy: function (request) {
        request = request || {};
        let code = this.safeCode(request.code || request.folderCode, 'Folder code');
        let existing = this.getConfiguredFolderPolicy(code);
        if (request.create === true && existing) {
            throw new CLASSES.NodicsError('ERR_MED_00007', 'Media folder already exists');
        }
        if (request.create !== true && !existing) {
            throw new CLASSES.NodicsError('ERR_MED_00003', 'Invalid media folder');
        }
        let next = this.normalizeFolderPolicy(code, request, existing || {});
        this.writeFolderPolicy(code, next, request.tenant);
        return this.projectConfiguredFolderPolicy(code, next);
    },

    /**
     * Activates or deactivates one configured media folder policy.
     *
     * @param {Object} request Folder lifecycle request.
     * @param {string} status Next status.
     * @returns {Object} Safe folder policy projection.
     */
    setFolderPolicyStatus: function (request, status) {
        request = request || {};
        let code = this.safeCode(request.code || request.folderCode, 'Folder code');
        let existing = this.getConfiguredFolderPolicy(code);
        if (!existing) {
            throw new CLASSES.NodicsError('ERR_MED_00003', 'Invalid media folder');
        }
        let next = Object.assign({}, existing, { status: status });
        this.writeFolderPolicy(code, next, request.tenant);
        return this.projectConfiguredFolderPolicy(code, next);
    },

    /**
     * Creates or updates one effective media format policy in runtime configuration.
     *
     * @param {Object} request Format policy mutation request.
     * @returns {Object} Safe format policy projection.
     */
    saveFormatPolicy: function (request) {
        request = request || {};
        let code = this.safeCode(request.code || request.formatCode, 'Format code');
        let existing = this.getConfiguredFormatPolicy(code);
        if (request.create === true && existing) {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'Media format already exists');
        }
        if (request.create !== true && !existing) {
            throw new CLASSES.NodicsError('ERR_MED_00010', 'Invalid media format');
        }
        let next = this.normalizeFormatPolicy(code, request, existing || {});
        this.writeFormatPolicy(code, next, request.tenant);
        return this.projectConfiguredFormatPolicy(code, next);
    },

    /**
     * Activates or deactivates one configured media format policy.
     *
     * @param {Object} request Format lifecycle request.
     * @param {string} status Next status.
     * @returns {Object} Safe format policy projection.
     */
    setFormatPolicyStatus: function (request, status) {
        request = request || {};
        let code = this.safeCode(request.code || request.formatCode, 'Format code');
        let existing = this.getConfiguredFormatPolicy(code);
        if (!existing) {
            throw new CLASSES.NodicsError('ERR_MED_00010', 'Invalid media format');
        }
        let next = Object.assign({}, existing, { status: status });
        this.writeFormatPolicy(code, next, request.tenant);
        return this.projectConfiguredFormatPolicy(code, next);
    },

    /**
     * Normalizes and validates the mutable folder policy fields.
     *
     * @param {string} code Folder code.
     * @param {Object} request Mutation request.
     * @param {Object} existing Existing policy.
     * @returns {Object} Normalized policy.
     */
    normalizeFolderPolicy: function (code, request, existing) {
        let access = request.access !== undefined ? request.access : existing.access || 'PRIVATE';
        if (!['PRIVATE', 'PUBLIC', 'SIGNED'].includes(access)) {
            throw new CLASSES.NodicsError('ERR_MED_00008', 'Invalid media folder access policy');
        }
        let status = request.status !== undefined ? request.status : existing.status || 'ACTIVE';
        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            throw new CLASSES.NodicsError('ERR_MED_00008', 'Invalid media folder status');
        }
        let storagePrefix = request.storagePrefix !== undefined ? request.storagePrefix : existing.storagePrefix;
        if (!this.isSafeStoragePrefix(storagePrefix)) {
            throw new CLASSES.NodicsError('ERR_MED_00008', 'Invalid media folder storage prefix');
        }
        return {
            code: code,
            name: this.safeOptionalText(request.name !== undefined ? request.name : existing.name) || code,
            description: this.safeOptionalText(request.description !== undefined ? request.description : existing.description) || '',
            storagePrefix: storagePrefix,
            access: access,
            allowedExtensions: this.normalizeStringList(request.allowedExtensions !== undefined ? request.allowedExtensions : existing.allowedExtensions),
            allowedMimeTypes: this.normalizeStringList(request.allowedMimeTypes !== undefined ? request.allowedMimeTypes : existing.allowedMimeTypes),
            maximumFileSizeBytes: this.normalizeNonNegativeInteger(request.maximumFileSizeBytes !== undefined ? request.maximumFileSizeBytes : existing.maximumFileSizeBytes || 0, 'maximumFileSizeBytes'),
            retentionDays: this.normalizeNonNegativeInteger(request.retentionDays !== undefined ? request.retentionDays : existing.retentionDays || 0, 'retentionDays'),
            status: status
        };
    },

    /**
     * Normalizes and validates mutable format policy fields.
     *
     * @param {string} code Format code.
     * @param {Object} request Mutation request.
     * @param {Object} existing Existing policy.
     * @returns {Object} Normalized policy.
     */
    normalizeFormatPolicy: function (code, request, existing) {
        let status = request.status !== undefined ? request.status : existing.status || 'ACTIVE';
        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Invalid media format status');
        }
        let formatFamily = request.formatFamily !== undefined ? request.formatFamily : existing.formatFamily || 'CUSTOM';
        if (!['ORIGINAL', 'RESPONSIVE', 'PREVIEW', 'IMPORT', 'EXPORT', 'DOCUMENT', 'CUSTOM'].includes(formatFamily)) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Invalid media format family');
        }
        return {
            code: code,
            name: this.safeOptionalText(request.name !== undefined ? request.name : existing.name) || code,
            description: this.safeOptionalText(request.description !== undefined ? request.description : existing.description) || '',
            purpose: this.safeOptionalText(request.purpose !== undefined ? request.purpose : existing.purpose) || '',
            width: this.normalizeNonNegativeOptionalInteger(request.width !== undefined ? request.width : existing.width, 'width'),
            height: this.normalizeNonNegativeOptionalInteger(request.height !== undefined ? request.height : existing.height, 'height'),
            formatFamily: formatFamily,
            status: status
        };
    },

    /**
     * Writes an effective folder policy through the existing CONFIG registry.
     *
     * @param {string} code Folder code.
     * @param {Object} policy Normalized policy.
     * @param {string} tenant Optional tenant.
     */
    writeFolderPolicy: function (code, policy, tenant) {
        if (typeof CONFIG === 'undefined' || !CONFIG.get || !CONFIG.setProperties) {
            throw new CLASSES.NodicsError('ERR_MED_00009', 'Media folder policy runtime configuration is not writable');
        }
        let properties = CONFIG.getProperties ? (CONFIG.getProperties(tenant) || CONFIG.getProperties()) : undefined;
        if (!properties) {
            properties = {};
            let currentMedia = CONFIG.get('media', tenant) || CONFIG.get('media') || {};
            properties.media = currentMedia;
        }
        let nextProperties = Object.assign({}, properties);
        nextProperties.media = Object.assign({}, properties.media || {});
        nextProperties.media.folders = Object.assign({}, nextProperties.media.folders || {});
        nextProperties.media.folders[code] = policy;
        CONFIG.setProperties(nextProperties, tenant);
    },

    /**
     * Writes an effective format policy through the existing CONFIG registry.
     *
     * @param {string} code Format code.
     * @param {Object} policy Normalized policy.
     * @param {string} tenant Optional tenant.
     */
    writeFormatPolicy: function (code, policy, tenant) {
        if (typeof CONFIG === 'undefined' || !CONFIG.get || !CONFIG.setProperties) {
            throw new CLASSES.NodicsError('ERR_MED_00013', 'Media format policy runtime configuration is not writable');
        }
        let properties = CONFIG.getProperties ? (CONFIG.getProperties(tenant) || CONFIG.getProperties()) : undefined;
        if (!properties) {
            properties = {};
            let currentMedia = CONFIG.get('media', tenant) || CONFIG.get('media') || {};
            properties.media = currentMedia;
        }
        let nextProperties = Object.assign({}, properties);
        nextProperties.media = Object.assign({}, properties.media || {});
        nextProperties.media.formats = Object.assign({}, nextProperties.media.formats || {});
        nextProperties.media.formats[code] = policy;
        CONFIG.setProperties(nextProperties, tenant);
    },

    /** @param {string} value Value to validate. @param {string} label Error label. @returns {string} Safe code. */
    safeCode: function (value, label) {
        if (typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(value)) {
            throw new CLASSES.NodicsError('ERR_MED_00008', label + ' is invalid');
        }
        return value;
    },

    /** @param {string} value Storage prefix. @returns {boolean} True when provider-relative and safe. */
    isSafeStoragePrefix: function (value) {
        return typeof value === 'string' &&
            value.trim() === value &&
            value.length > 0 &&
            value.length <= 256 &&
            !path.isAbsolute(value) &&
            !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) &&
            !value.split(/[\\/]+/).some(part => part === '..' || part === '.');
    },

    /** @param {unknown} value Value. @returns {string} Safe text. */
    safeOptionalText: function (value) {
        if (value === undefined || value === null) {
            return '';
        }
        if (typeof value !== 'string' || value.length > 500) {
            throw new CLASSES.NodicsError('ERR_MED_00008', 'Invalid media folder text');
        }
        return value.trim();
    },

    /** @param {unknown} value Value. @returns {Array<string>} Normalized string list. */
    normalizeStringList: function (value) {
        if (value === undefined || value === null) {
            return [];
        }
        if (!Array.isArray(value)) {
            throw new CLASSES.NodicsError('ERR_MED_00008', 'Media folder policy list must be an array');
        }
        return Array.from(new Set(value.map(item => {
            if (typeof item !== 'string' || !item.trim() || item.length > 200) {
                throw new CLASSES.NodicsError('ERR_MED_00008', 'Invalid media folder policy list item');
            }
            return item.trim();
        })));
    },

    /** @param {unknown} value Value. @param {string} label Label. @returns {number} Integer. */
    normalizeNonNegativeInteger: function (value, label) {
        let number = Number(value || 0);
        if (!Number.isSafeInteger(number) || number < 0) {
            throw new CLASSES.NodicsError('ERR_MED_00008', 'Invalid media folder ' + label);
        }
        return number;
    },

    /** @param {unknown} value Value. @param {string} label Label. @returns {number|undefined} Optional integer. */
    normalizeNonNegativeOptionalInteger: function (value, label) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        let number = Number(value);
        if (!Number.isSafeInteger(number) || number < 0) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Invalid media format ' + label);
        }
        return number;
    },

    /**
     * Returns a copy of configured media context descriptors.
     *
     * @returns {Object} Configured media contexts keyed by context code.
     */
    getContextPolicies: function () {
        let configuration = this.getConfiguration();
        return configuration.contexts || {};
    },

    /**
     * Returns ordered backend-owned media context metadata for clients such as Axis.
     *
     * @returns {Array<Object>} Safe media context metadata.
     */
    listMediaContexts: function () {
        let contexts = this.getContextPolicies();
        return Object.keys(contexts).map(code => this.projectMediaContext(code, contexts[code]));
    },

    /**
     * Projects one configured media context without exposing provider internals.
     *
     * @param {string} code Context code.
     * @param {Object} context Configured context descriptor.
     * @returns {Object} Safe media context projection.
     */
    projectMediaContext: function (code, context) {
        context = context || {};
        let folderCodes = this.copyStringList(context.folderCodes);
        let defaultFolderCode = context.defaultFolderCode || folderCodes[0] || 'default';
        let allowedFolderCodes = folderCodes.length ? folderCodes : [defaultFolderCode];
        return {
            code: context.code || code,
            sourceType: context.sourceType || context.label || context.code || code,
            aliases: this.copyStringList(context.aliases),
            label: context.label || context.code || code,
            description: context.description || '',
            folderCodes: allowedFolderCodes,
            defaultFolderCode: defaultFolderCode,
            allowedFolders: allowedFolderCodes.map(folderCode => this.projectFolderPolicy(folderCode)),
            allowedFormatCodes: this.copyStringList(context.allowedFormatCodes),
            defaultFormatCode: context.defaultFormatCode || 'original',
            defaultModuleName: context.defaultModuleName,
            defaultSchemaName: context.defaultSchemaName,
            targetRequired: context.targetRequired === true,
            manualUploadEnabled: context.manualUploadEnabled === true,
            storageRouteTemplate: context.storageRouteTemplate || ''
        };
    },

    /**
     * Projects one folder policy as safe client metadata.
     *
     * @param {string} folderCode Folder code.
     * @returns {Object} Safe folder policy projection.
     */
    projectFolderPolicy: function (folderCode) {
        let folder = this.getFolderPolicy(folderCode);
        return this.projectConfiguredFolderPolicy(folder.code, folder);
    },

    /**
     * Projects one configured folder policy as safe client metadata.
     *
     * @param {string} folderCode Folder code.
     * @param {Object} folder Folder policy.
     * @returns {Object} Safe folder policy projection.
     */
    projectConfiguredFolderPolicy: function (folderCode, folder) {
        let configuration = this.getConfiguration();
        let upload = configuration.upload || {};
        let allowedExtensions = folder.allowedExtensions && folder.allowedExtensions.length ? folder.allowedExtensions : upload.defaultAllowedExtensions || [];
        let allowedMimeTypes = folder.allowedMimeTypes && folder.allowedMimeTypes.length ? folder.allowedMimeTypes : upload.defaultAllowedMimeTypes || [];
        return {
            folderCode: folder.code || folderCode,
            name: folder.name || folder.code || folderCode,
            description: folder.description || '',
            storagePrefix: folder.storagePrefix,
            access: folder.access,
            retentionDays: Number(folder.retentionDays || 0),
            status: folder.status || 'ACTIVE',
            uploadPolicy: {
                maximumFileSizeBytes: Number(folder.maximumFileSizeBytes || upload.maximumFileSizeBytes || 0),
                allowedExtensions: this.copyStringList(allowedExtensions),
                allowedMimeTypes: this.copyStringList(allowedMimeTypes),
                checksumAlgorithm: upload.checksumAlgorithm || 'sha256'
            }
        };
    },

    /**
     * Projects one format policy as safe client metadata.
     *
     * @param {string} formatCode Format code.
     * @returns {Object} Safe format policy projection.
     */
    projectFormatPolicy: function (formatCode) {
        let format = this.getFormatPolicy(formatCode);
        return this.projectConfiguredFormatPolicy(format.code, format);
    },

    /**
     * Projects one configured format policy as safe client metadata.
     *
     * @param {string} formatCode Format code.
     * @param {Object} format Format policy.
     * @returns {Object} Safe format policy projection.
     */
    projectConfiguredFormatPolicy: function (formatCode, format) {
        return {
            formatCode: format.code || formatCode,
            code: format.code || formatCode,
            name: format.name || format.code || formatCode,
            description: format.description || '',
            purpose: format.purpose || '',
            width: format.width,
            height: format.height,
            formatFamily: format.formatFamily || 'CUSTOM',
            status: format.status || 'ACTIVE'
        };
    },

    /**
     * Projects safe delivery policy metadata for BackOffice operations.
     *
     * @returns {Object} Safe delivery policy summary.
     */
    projectDeliveryPolicy: function () {
        let configuration = this.getConfiguration();
        let delivery = configuration.delivery || {};
        return {
            enabled: delivery.enabled === true,
            publicAccessEnabled: delivery.publicAccessEnabled === true,
            signedAccessEnabled: delivery.signedAccessEnabled === true,
            privateAccessEnabled: delivery.privateAccessEnabled === true,
            cacheControl: delivery.cacheControl || '',
            contentDisposition: delivery.contentDisposition || 'inline'
        };
    },

    /**
     * Copies a string array from configuration while dropping blank values.
     *
     * @param {Array<string>} values Configured values.
     * @returns {Array<string>} Safe string values.
     */
    copyStringList: function (values) {
        if (!Array.isArray(values)) {
            return [];
        }
        return values.filter(value => typeof value === 'string' && value.trim()).map(value => value.trim());
    },

    /**
     * Returns the selected storage provider configuration.
     *
     * @param {string} providerCode Optional provider code.
     * @returns {Object} Provider descriptor.
     */
    getProviderPolicy: function (providerCode) {
        let configuration = this.getConfiguration();
        let storage = configuration.storage || {};
        let providers = storage.providers || {};
        let effectiveProviderCode = providerCode || storage.defaultProvider;
        let provider = providers[effectiveProviderCode];
        if (!effectiveProviderCode || !provider || provider.enabled !== true) {
            throw new CLASSES.NodicsError('ERR_MED_00002', 'Invalid media storage provider');
        }
        return {
            code: effectiveProviderCode,
            provider: Object.assign({}, provider),
            storage: Object.assign({}, storage)
        };
    },

    /**
     * Validates filename, MIME, extension, and size against upload/folder policy.
     *
     * @param {Object} request Media descriptor request.
     * @returns {Object} Sanitized descriptor.
     */
    validateDescriptor: function (request) {
        request = request || {};
        let fileName = request.fileName || request.originalFileName;
        if (!fileName || typeof fileName !== 'string') {
            throw new CLASSES.NodicsError('ERR_MED_00001', 'Invalid media request: fileName is required');
        }
        let sanitizedFileName = this.sanitizeFileName(fileName);
        if (!sanitizedFileName) {
            throw new CLASSES.NodicsError('ERR_MED_00001', 'Invalid media request: fileName is invalid');
        }
        let extension = this.resolveExtension(sanitizedFileName);
        let configuration = this.getConfiguration();
        let upload = configuration.upload || {};
        let folder = this.getFolderPolicy(request.folderCode);
        let format = this.getFormatPolicy(request.formatCode || 'original');
        let allowedExtensions = folder.allowedExtensions && folder.allowedExtensions.length ? folder.allowedExtensions : upload.defaultAllowedExtensions || [];
        let allowedMimeTypes = folder.allowedMimeTypes && folder.allowedMimeTypes.length ? folder.allowedMimeTypes : upload.defaultAllowedMimeTypes || [];
        let maximumFileSizeBytes = Number(folder.maximumFileSizeBytes || upload.maximumFileSizeBytes || 0);
        let sizeBytes = Number(request.sizeBytes || 0);
        if (allowedExtensions.length && !allowedExtensions.map(item => String(item).toLowerCase()).includes(extension)) {
            throw new CLASSES.NodicsError('ERR_MED_00005', 'Media file extension is not allowed');
        }
        if (request.mimeType && allowedMimeTypes.length && !allowedMimeTypes.includes(request.mimeType)) {
            throw new CLASSES.NodicsError('ERR_MED_00005', 'Media MIME type is not allowed');
        }
        if (maximumFileSizeBytes > 0 && sizeBytes > maximumFileSizeBytes) {
            throw new CLASSES.NodicsError('ERR_MED_00005', 'Media file size exceeds folder policy');
        }
        return Object.assign({}, request, {
            fileName: sanitizedFileName,
            originalFileName: fileName,
            extension: extension,
            folder: folder,
            format: format,
            formatCode: format.code,
            uploadPolicy: {
                maximumFileSizeBytes: maximumFileSizeBytes,
                allowedExtensions: allowedExtensions,
                allowedMimeTypes: allowedMimeTypes,
                checksumAlgorithm: upload.checksumAlgorithm || 'sha256'
            }
        });
    },

    /**
     * Sanitizes a filename without accepting any directory segment.
     *
     * @param {string} fileName User-facing filename.
     * @returns {string} Sanitized filename.
     */
    sanitizeFileName: function (fileName) {
        let base = path.basename(String(fileName || '')).replace(/[^a-zA-Z0-9._-]/g, '-');
        if (base === '.' || base === '..') {
            return '';
        }
        return base;
    },

    /**
     * Resolves lowercase extension without leading dot.
     *
     * @param {string} fileName Filename.
     * @returns {string} Extension.
     */
    resolveExtension: function (fileName) {
        let extension = path.extname(fileName || '').replace('.', '').toLowerCase();
        if (!extension) {
            throw new CLASSES.NodicsError('ERR_MED_00005', 'Media file extension is required');
        }
        return extension;
    }
};
