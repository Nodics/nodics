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
        return Object.assign({}, folder, { code: folder.code || effectiveFolderCode });
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
        let configuration = this.getConfiguration();
        let upload = configuration.upload || {};
        let allowedExtensions = folder.allowedExtensions && folder.allowedExtensions.length ? folder.allowedExtensions : upload.defaultAllowedExtensions || [];
        let allowedMimeTypes = folder.allowedMimeTypes && folder.allowedMimeTypes.length ? folder.allowedMimeTypes : upload.defaultAllowedMimeTypes || [];
        return {
            folderCode: folder.code,
            storagePrefix: folder.storagePrefix,
            access: folder.access,
            retentionDays: Number(folder.retentionDays || 0),
            uploadPolicy: {
                maximumFileSizeBytes: Number(folder.maximumFileSizeBytes || upload.maximumFileSizeBytes || 0),
                allowedExtensions: this.copyStringList(allowedExtensions),
                allowedMimeTypes: this.copyStringList(allowedMimeTypes),
                checksumAlgorithm: upload.checksumAlgorithm || 'sha256'
            }
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
