/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/config/properties
 * @description Defines provider-neutral media lifecycle configuration.
 * @layer config
 * @owner nMedia
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    bodyParserHandler: {
        mediaMultipartUploadBodyParserHandler: 'DefaultMediaMultipartUploadBodyParserHandlerService'
    },
    media: {
        storage: {
            defaultProvider: 'local',
            keyStrategy: 'tenantFolderDateUuid',
            exposeAbsolutePath: false,
            providers: {
                local: {
                    enabled: true,
                    service: 'DefaultLocalMediaStorageProviderService',
                    basePath: 'runtime/media',
                    baseUrl: '/nodics/media/v0/content'
                },
                nas: {
                    enabled: false,
                    service: 'DefaultNasMediaStorageProviderService',
                    basePath: '/mnt/nodics-media',
                    baseUrl: 'https://media.example.com'
                },
                s3: {
                    enabled: false,
                    service: 'DefaultS3MediaStorageProviderService',
                    bucket: '',
                    region: '',
                    baseUrl: ''
                },
                azureBlob: {
                    enabled: false,
                    service: 'DefaultAzureBlobMediaStorageProviderService',
                    container: '',
                    baseUrl: ''
                },
                gcpStorage: {
                    enabled: false,
                    service: 'DefaultGcpMediaStorageProviderService',
                    bucket: '',
                    baseUrl: ''
                }
            }
        },
        upload: {
            maximumFileSizeBytes: 52428800,
            maximumFiles: 1,
            maximumFields: 50,
            maximumFieldSizeBytes: 1048576,
            checksumAlgorithm: 'sha256',
            defaultAllowedExtensions: ['csv', 'gif', 'jpeg', 'jpg', 'json', 'pdf', 'png', 'svg', 'webp', 'xls', 'xlsx'],
            defaultAllowedMimeTypes: [
                'application/json',
                'application/pdf',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/gif',
                'image/jpeg',
                'image/png',
                'image/svg+xml',
                'image/webp',
                'text/csv'
            ]
        },
        folders: {
            default: {
                code: 'default',
                storagePrefix: 'general',
                access: 'PRIVATE',
                allowedExtensions: [],
                allowedMimeTypes: [],
                maximumFileSizeBytes: 0,
                retentionDays: 0
            },
            importSources: {
                code: 'importSources',
                storagePrefix: 'imports',
                access: 'PRIVATE',
                allowedExtensions: ['csv', 'json', 'xls', 'xlsx'],
                allowedMimeTypes: [
                    'application/json',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/csv'
                ],
                maximumFileSizeBytes: 52428800,
                retentionDays: 30
            },
            cmsAssets: {
                code: 'cmsAssets',
                storagePrefix: 'cms',
                access: 'PUBLIC',
                allowedExtensions: ['gif', 'jpeg', 'jpg', 'pdf', 'png', 'svg', 'webp'],
                allowedMimeTypes: ['application/pdf', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
                maximumFileSizeBytes: 52428800,
                retentionDays: 0
            },
            productAssets: {
                code: 'productAssets',
                storagePrefix: 'products',
                access: 'PUBLIC',
                allowedExtensions: ['gif', 'jpeg', 'jpg', 'pdf', 'png', 'webp'],
                allowedMimeTypes: ['application/pdf', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'],
                maximumFileSizeBytes: 52428800,
                retentionDays: 0
            }
        },
        formats: {
            original: { code: 'original', description: 'Original uploaded media' },
            thumbnail: { code: 'thumbnail', description: 'Small preview media' },
            small: { code: 'small', description: 'Small responsive media variant' },
            medium: { code: 'medium', description: 'Medium responsive media variant' },
            large: { code: 'large', description: 'Large responsive media variant' },
            zoom: { code: 'zoom', description: 'High-detail zoom media variant' },
            desktop: { code: 'desktop', description: 'Desktop presentation media' },
            mobile: { code: 'mobile', description: 'Mobile presentation media' },
            importFile: { code: 'importFile', description: 'File staged for governed data import' }
        },
        referenceLookup: {
            requireServiceToken: true,
            maximumResults: 2,
            activeMediaStatuses: ['READY', 'CONSUMED'],
            activeMediaSetStatuses: ['ACTIVE']
        },
        importSource: {
            allowedFolders: ['importSources'],
            allowedFormats: ['importFile'],
            allowedStatuses: ['READY', 'CONSUMED'],
            maximumResults: 2
        }
    }
};
