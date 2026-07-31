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
    responseHandler: {
        mediaContentResponseHandler: 'DefaultMediaContentResponseHandlerService'
    },
    backofficeCapabilities: {
        media: {
            enabled: true,
            capabilityId: 'media-management',
            displayName: 'Media Management',
            category: 'platform',
            icon: 'media',
            contractVersion: 1,
            minimumClientContractVersion: 1,
            roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: {
                openApiPath: '/nodics/media/v0/contract/openapi',
                contractVersion: 1
            },
            requiredPermissions: ['media.storage.policy.view'],
            navigation: [
                {
                    id: 'media-management',
                    label: 'Media Management',
                    route: '/media-management',
                    icon: 'media',
                    order: 100,
                    group: { id: 'media-management', label: 'Media Management', order: 250 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'ACTIVE',
                    requiredPermissions: ['media.storage.policy.view']
                },
                {
                    id: 'media',
                    parentId: 'media-management',
                    label: 'Media',
                    route: '/media-management/media',
                    icon: 'media',
                    order: 110,
                    group: { id: 'media-management', label: 'Media Management', order: 250 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'PREVIEW',
                    requiredPermissions: ['media.storage.policy.view']
                },
                {
                    id: 'media-folders',
                    parentId: 'media-management',
                    label: 'Media Folders',
                    route: '/media-management/folders',
                    icon: 'folder',
                    order: 120,
                    group: { id: 'media-management', label: 'Media Management', order: 250 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'PREVIEW',
                    requiredPermissions: ['media.storage.policy.view']
                },
                {
                    id: 'media-sets',
                    parentId: 'media-management',
                    label: 'Media Sets',
                    route: '/media-management/sets',
                    icon: 'gallery',
                    order: 130,
                    group: { id: 'media-management', label: 'Media Management', order: 250 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'PREVIEW',
                    requiredPermissions: ['media.storage.policy.view']
                },
                {
                    id: 'media-formats',
                    parentId: 'media-management',
                    label: 'Media Formats',
                    route: '/media-management/formats',
                    icon: 'format',
                    order: 140,
                    group: { id: 'media-management', label: 'Media Management', order: 250 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'PREVIEW',
                    requiredPermissions: ['media.storage.policy.view']
                },
                {
                    id: 'media-usage',
                    parentId: 'media-management',
                    label: 'Media Usage',
                    route: '/media-management/usage',
                    icon: 'reference',
                    order: 150,
                    group: { id: 'media-management', label: 'Media Management', order: 250 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'PREVIEW',
                    requiredPermissions: ['media.storage.policy.view']
                },
                {
                    id: 'storage-delivery',
                    parentId: 'media-management',
                    label: 'Storage and Delivery',
                    route: '/media-management/storage-delivery',
                    icon: 'storage',
                    order: 160,
                    group: { id: 'media-management', label: 'Media Management', order: 250 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'PREVIEW',
                    requiredPermissions: ['media.storage.policy.view']
                }
            ]
        }
    },
    media: {
        storage: {
            defaultProvider: 'local',
            defaultKeyStrategy: 'tenantEnterpriseSchemaDateMedia',
            keyStrategies: {
                default: 'tenantEnterpriseSchemaDateMedia',
                importSources: 'tenantEnterpriseSchemaDateMedia',
                exportFiles: 'tenantEnterpriseSchemaDateMedia',
                cmsAssets: 'tenantEnterpriseSchemaDateMedia',
                productAssets: 'tenantEnterpriseSchemaDateMedia'
            },
            keyStrategyServices: {
                tenantEnterpriseSchemaDateMedia: 'DefaultTenantEnterpriseSchemaDateMediaKeyStrategyService'
            },
            exposeAbsolutePath: false,
            providers: {
                local: {
                    enabled: true,
                    service: 'DefaultLocalMediaStorageProviderService',
                    basePath: '',
                    fallbackRelativeBasePath: 'temp/media',
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
                storagePrefix: 'media/utility',
                access: 'PRIVATE',
                allowedExtensions: [],
                allowedMimeTypes: [],
                maximumFileSizeBytes: 0,
                retentionDays: 0
            },
            importSources: {
                code: 'importSources',
                storagePrefix: 'data/import',
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
            exportFiles: {
                code: 'exportFiles',
                storagePrefix: 'data/export',
                access: 'PRIVATE',
                allowedExtensions: ['csv', 'json', 'pdf', 'xls', 'xlsx', 'zip'],
                allowedMimeTypes: [
                    'application/json',
                    'application/pdf',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/zip',
                    'text/csv'
                ],
                maximumFileSizeBytes: 52428800,
                retentionDays: 30
            },
            cmsAssets: {
                code: 'cmsAssets',
                storagePrefix: 'media/content',
                access: 'PUBLIC',
                allowedExtensions: ['gif', 'jpeg', 'jpg', 'pdf', 'png', 'svg', 'webp'],
                allowedMimeTypes: ['application/pdf', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
                maximumFileSizeBytes: 52428800,
                retentionDays: 0
            },
            productAssets: {
                code: 'productAssets',
                storagePrefix: 'media/product',
                access: 'PUBLIC',
                allowedExtensions: ['gif', 'jpeg', 'jpg', 'pdf', 'png', 'webp'],
                allowedMimeTypes: ['application/pdf', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'],
                maximumFileSizeBytes: 52428800,
                retentionDays: 0
            }
        },
        contexts: {
            dataImports: {
                code: 'dataImports',
                label: 'Data imports',
                description: 'Governed files uploaded for validation and processing by nImport.',
                folderCodes: ['importSources'],
                defaultFolderCode: 'importSources',
                allowedFormatCodes: ['importFile'],
                defaultFormatCode: 'importFile',
                defaultModuleName: 'import',
                defaultSchemaName: 'mediaImport',
                targetRequired: true,
                manualUploadEnabled: true,
                storageRouteTemplate: 'data/import/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}'
            },
            dataExports: {
                code: 'dataExports',
                label: 'Data exports',
                description: 'Governed files generated by nExport workflows and exposed through media delivery.',
                folderCodes: ['exportFiles'],
                defaultFolderCode: 'exportFiles',
                allowedFormatCodes: ['exportFile'],
                defaultFormatCode: 'exportFile',
                targetRequired: true,
                manualUploadEnabled: false,
                storageRouteTemplate: 'data/export/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}'
            },
            productMedia: {
                code: 'productMedia',
                label: 'Product media',
                description: 'Reusable product assets such as catalog images, manuals, galleries, and product documents.',
                folderCodes: ['productAssets'],
                defaultFolderCode: 'productAssets',
                allowedFormatCodes: ['original', 'thumbnail', 'small', 'medium', 'large', 'zoom'],
                defaultFormatCode: 'original',
                defaultModuleName: 'product',
                defaultSchemaName: 'product',
                targetRequired: false,
                manualUploadEnabled: true,
                storageRouteTemplate: 'media/product/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}'
            },
            contentMedia: {
                code: 'contentMedia',
                label: 'Content media',
                description: 'Reusable CMS and storefront content assets such as banners, icons, page imagery, and documents.',
                folderCodes: ['cmsAssets'],
                defaultFolderCode: 'cmsAssets',
                allowedFormatCodes: ['original', 'thumbnail', 'desktop', 'mobile'],
                defaultFormatCode: 'original',
                defaultModuleName: 'cms',
                defaultSchemaName: 'cmsComponent',
                targetRequired: false,
                manualUploadEnabled: true,
                storageRouteTemplate: 'media/content/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}'
            },
            utilityMedia: {
                code: 'utilityMedia',
                label: 'Utility media',
                description: 'General governed files that are not owned by product, content, import, or export flows.',
                folderCodes: ['default'],
                defaultFolderCode: 'default',
                allowedFormatCodes: ['original'],
                defaultFormatCode: 'original',
                targetRequired: false,
                manualUploadEnabled: true,
                storageRouteTemplate: 'media/utility/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}'
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
            importFile: { code: 'importFile', description: 'File staged for governed data import' },
            exportFile: { code: 'exportFile', description: 'File generated by governed data export' }
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
        },
        delivery: {
            enabled: true,
            allowedStatuses: ['READY', 'CONSUMED'],
            publicAccessEnabled: true,
            signedAccessEnabled: false,
            privateAccessEnabled: true,
            maximumResults: 2,
            cacheControl: 'public, max-age=3600',
            contentDisposition: 'inline'
        }
    }
};
