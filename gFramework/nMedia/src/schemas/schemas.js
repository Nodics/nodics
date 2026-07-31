/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/schemas/schemas
 * @description Defines provider-neutral media lifecycle schemas.
 * @layer schemas
 * @owner nMedia
 * @override Later active modules may extend media metadata or references while preserving nMedia ownership of binary lifecycle.
 */
module.exports = {
    media: {
        mediaFolder: {
            super: 'base',
            model: true,
            service: { enabled: true },
            event: { enabled: true, type: 'SYNC' },
            router: { enabled: true },
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Unique folder code used by callers, for example importSources or cmsAssets',
                },
                name: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'User-facing folder name',
                },
                storagePrefix: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Provider-relative prefix controlled by backend configuration',
                },
                access: {
                    enum: ['PRIVATE', 'PUBLIC', 'SIGNED'],
                    required: true,
                    description: 'Default access mode for media stored in this folder',
                },
                allowedExtensions: {
                    type: 'object',
                    required: false,
                    description: 'Allowed file extensions for this folder',
                },
                allowedMimeTypes: {
                    type: 'object',
                    required: false,
                    description: 'Allowed MIME types for this folder',
                },
                maximumFileSizeBytes: {
                    type: 'int',
                    required: false,
                    description: 'Folder-specific upload size limit',
                },
                retentionDays: {
                    type: 'int',
                    required: false,
                    description: 'Optional retention window for cleanup',
                },
                status: {
                    enum: ['ACTIVE', 'INACTIVE'],
                    required: true,
                    default: 'ACTIVE',
                    searchOptions: { enabled: true },
                    description: 'Folder policy lifecycle status. Inactive folders are not eligible for new uploads.',
                },
            },
        },
        mediaFormat: {
            super: 'base',
            model: true,
            service: { enabled: true },
            event: { enabled: true, type: 'SYNC' },
            router: { enabled: true },
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Unique media format code such as original, thumbnail, desktop, mobile, or importFile',
                },
                name: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'User-facing media format name',
                },
                description: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Purpose of this format',
                },
                width: {
                    type: 'int',
                    required: false,
                    description: 'Optional expected width in pixels',
                },
                height: {
                    type: 'int',
                    required: false,
                    description: 'Optional expected height in pixels',
                },
                purpose: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Business purpose or rendering purpose for this format',
                },
                formatFamily: {
                    enum: ['ORIGINAL', 'RESPONSIVE', 'PREVIEW', 'IMPORT', 'EXPORT', 'DOCUMENT', 'CUSTOM'],
                    required: true,
                    default: 'CUSTOM',
                    searchOptions: { enabled: true },
                    description: 'Reusable format family used for filtering and customer extensions',
                },
                status: {
                    enum: ['ACTIVE', 'INACTIVE'],
                    required: true,
                    default: 'ACTIVE',
                    searchOptions: { enabled: true },
                    description: 'Format lifecycle status. Inactive formats are not eligible for new uploads or variants.',
                },
            },
        },
        media: {
            super: 'base',
            model: true,
            service: { enabled: true },
            event: { enabled: true, type: 'SYNC' },
            router: { enabled: true },
            backoffice: {
                excludedFields: ['storageKey', 'storedFileName', 'relativePath', 'fullPath', 'url', 'accessUrl'],
            },
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Unique media item code',
                },
                name: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'User-facing media name',
                },
                description: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Media description for business users',
                },
                folderCode: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'nMedia folder policy code',
                },
                formatCode: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'nMedia format code',
                },
                providerCode: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Storage provider used for this media item',
                },
                storageKey: {
                    type: 'string',
                    required: true,
                    description: 'Provider-relative storage key generated by nMedia',
                },
                originalFileName: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Original filename supplied by the uploader',
                },
                storedFileName: {
                    type: 'string',
                    required: false,
                    description: 'Sanitized generated filename stored by the provider',
                },
                relativePath: {
                    type: 'string',
                    required: false,
                    description: 'Provider-relative readable path for this media; usually the same value as storageKey',
                },
                fullPath: {
                    type: 'string',
                    required: false,
                    description: 'Backend-resolved full storage path or provider locator retained for governed processing',
                },
                url: {
                    type: 'string',
                    required: false,
                    description: 'Public, signed, or API-delivery URL resolved by the provider policy',
                },
                accessUrl: {
                    type: 'string',
                    required: false,
                    description: 'Readable alias for the effective media access URL when the provider can resolve one',
                },
                mimeType: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Validated MIME type',
                },
                extension: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Validated file extension',
                },
                sizeBytes: {
                    type: 'int',
                    required: false,
                    description: 'File size in bytes',
                },
                checksum: {
                    type: 'string',
                    required: false,
                    description: 'Checksum calculated by backend',
                },
                checksumAlgorithm: {
                    type: 'string',
                    required: false,
                    description: 'Checksum algorithm used by backend',
                },
                access: {
                    enum: ['PRIVATE', 'PUBLIC', 'SIGNED'],
                    required: true,
                    description: 'Effective access mode',
                },
                status: {
                    enum: ['UPLOADED', 'READY', 'CONSUMED', 'RETIRED', 'EXPIRED', 'FAILED'],
                    required: true,
                    default: 'UPLOADED',
                    description: 'Media lifecycle status',
                },
            },
        },
        mediaSet: {
            super: 'base',
            model: true,
            service: { enabled: true },
            event: { enabled: true, type: 'SYNC' },
            router: { enabled: true },
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Unique media set code for one logical asset',
                },
                name: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'User-facing media set name',
                },
                description: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Media set purpose',
                },
                mediaType: {
                    enum: ['IMAGE', 'VIDEO', 'DOCUMENT', 'FILE', 'MIXED'],
                    required: true,
                    default: 'IMAGE',
                    description: 'Type of logical asset represented by this media set',
                },
                businessPurpose: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Reusable purpose such as product-gallery, cms-asset, import-source, or documentation-asset',
                },
                status: {
                    enum: ['ACTIVE', 'INACTIVE', 'RETIRED'],
                    required: true,
                    default: 'ACTIVE',
                    description: 'Media set lifecycle status',
                },
            },
        },
        mediaSetEntry: {
            super: 'base',
            model: true,
            service: { enabled: true },
            event: { enabled: true, type: 'SYNC' },
            router: { enabled: true },
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Unique media set entry code',
                },
                mediaSetCode: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Owning media set code',
                },
                mediaCode: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Referenced media item code',
                },
                formatCode: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Format represented by this entry, such as thumbnail, mobile, desktop, zoom, or original',
                },
                variantRole: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Reusable variant role inside the set without product-specific meaning',
                },
                localeCode: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Optional locale for localized media',
                },
                channelCode: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Optional channel qualifier such as web, app, marketplace, or kiosk',
                },
                deviceCode: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Optional device qualifier such as desktop, mobile, tablet, or tv',
                },
                breakpointCode: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Optional responsive breakpoint qualifier such as sm, md, lg, or xl',
                },
                fallbackEntryCode: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Optional fallback media set entry code used when this entry is not applicable',
                },
                primary: {
                    type: 'boolean',
                    required: false,
                    default: false,
                    searchOptions: { enabled: true },
                    description: 'Marks the default entry inside one media set for generic selection.',
                },
                width: {
                    type: 'int',
                    required: false,
                    description: 'Concrete media width in pixels when known',
                },
                height: {
                    type: 'int',
                    required: false,
                    description: 'Concrete media height in pixels when known',
                },
                position: {
                    type: 'int',
                    required: false,
                    description: 'Display or fallback order within the media set',
                },
                status: {
                    enum: ['ACTIVE', 'INACTIVE'],
                    required: true,
                    default: 'ACTIVE',
                    description: 'Entry lifecycle status',
                },
            },
        },
        mediaReference: {
            super: 'base',
            model: true,
            service: { enabled: true },
            event: { enabled: true, type: 'SYNC' },
            router: { enabled: true },
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Unique media reference code',
                },
                ownerModule: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Module that owns the business object referencing this media',
                },
                ownerSchema: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Schema that owns the business object referencing this media',
                },
                ownerCode: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Business object code that references media',
                },
                mediaCode: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Referenced media item code',
                },
                mediaSetCode: {
                    type: 'string',
                    required: false,
                    searchOptions: { enabled: true },
                    description: 'Referenced media set code',
                },
                relationType: {
                    type: 'string',
                    required: true,
                    searchOptions: { enabled: true },
                    description: 'Business relationship type such as PRIMARY_IMAGE, GALLERY, DOCUMENT, IMPORT_SOURCE, or CMS_ASSET',
                },
                position: {
                    type: 'int',
                    required: false,
                    description: 'Display or processing order',
                },
                status: {
                    enum: ['ACTIVE', 'INACTIVE', 'RETIRED'],
                    required: true,
                    default: 'ACTIVE',
                    description: 'Reference lifecycle status',
                },
            },
        },
    },
};
