/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/router/routers
 * @description Defines nMedia route registration and HTTP exposure metadata.
 * @layer router
 * @owner nMedia
 * @override Later active modules may add media operations while preserving nMedia storage authority.
 */
module.exports = {
    media: {
        storagePolicy: {
            listMediaContexts: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.context.view',
                apiExposure: 'mediaManagement',
                key: '/contexts',
                method: 'GET',
                controller: 'DefaultMediaStorageController',
                operation: 'listMediaContexts',
                help: {
                    requestType: 'secured',
                    message: 'Returns backend-owned media source context metadata for upload and management clients. Does not expose provider secrets.',
                    method: 'GET',
                    url: 'http://host:port/nodics/media/v0/contexts'
                },
                responses: { '200': { description: 'Media source context metadata' } }
            },
            summarizeStorageProviders: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.storage.policy.view',
                apiExposure: 'mediaManagement',
                key: '/storage/providers/summary',
                method: 'GET',
                controller: 'DefaultMediaStorageController',
                operation: 'summarizeStorageProviders',
                help: {
                    requestType: 'secured',
                    message: 'Returns safe storage provider and delivery summary metadata without exposing paths, buckets, credentials, or secrets.',
                    method: 'GET',
                    url: 'http://host:port/nodics/media/v0/storage/providers/summary'
                },
                responses: { '200': { description: 'Safe media storage provider summary' } }
            },
            resolveStoragePolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.storage.policy.view',
                apiExposure: 'mediaManagement',
                key: '/storage/policy',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'resolveStoragePolicy',
                help: {
                    requestType: 'secured',
                    message: 'Returns upload/storage policy for a backend-owned media folder. Does not expose provider secrets.',
                    method: 'POST',
                    url: 'http://host:port/nodics/media/v0/storage/policy',
                    body: {
                        folderCode: 'importSources',
                        fileName: 'catalog.xlsx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        sizeBytes: 20480
                    }
                }
            },
            createFolderPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.folder.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/folders/policy',
                method: 'PUT',
                controller: 'DefaultMediaStorageController',
                operation: 'createFolderPolicy',
                help: {
                    requestType: 'secured',
                    message: 'Creates a backend-owned media folder policy in effective runtime configuration. Does not accept provider secrets or raw paths.',
                    method: 'PUT',
                    url: 'http://host:port/nodics/media/v0/folders/policy',
                    body: {
                        code: 'businessDocuments',
                        name: 'Business documents',
                        storagePrefix: 'media/business',
                        access: 'PRIVATE',
                        allowedExtensions: ['pdf'],
                        allowedMimeTypes: ['application/pdf'],
                        maximumFileSizeBytes: 10485760,
                        retentionDays: 90
                    }
                }
            },
            updateFolderPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.folder.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/folders/policy/:folderCode',
                method: 'PATCH',
                controller: 'DefaultMediaStorageController',
                operation: 'saveFolderPolicy',
                help: {
                    requestType: 'secured',
                    message: 'Updates a backend-owned media folder policy in effective runtime configuration. Does not accept provider secrets or raw paths.',
                    method: 'PATCH',
                    url: 'http://host:port/nodics/media/v0/folders/policy/{folderCode}'
                }
            },
            activateFolderPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.folder.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/folders/policy/:folderCode/activate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'activateFolderPolicy'
            },
            deactivateFolderPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.folder.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/folders/policy/:folderCode/deactivate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'deactivateFolderPolicy'
            },
            createFormatPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.format.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/formats/policy',
                method: 'PUT',
                controller: 'DefaultMediaStorageController',
                operation: 'createFormatPolicy',
                help: {
                    requestType: 'secured',
                    message: 'Creates a backend-owned media format policy in effective runtime configuration.',
                    method: 'PUT',
                    url: 'http://host:port/nodics/media/v0/formats/policy'
                }
            },
            updateFormatPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.format.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/formats/policy/:formatCode',
                method: 'PATCH',
                controller: 'DefaultMediaStorageController',
                operation: 'saveFormatPolicy'
            },
            activateFormatPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.format.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/formats/policy/:formatCode/activate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'activateFormatPolicy'
            },
            deactivateFormatPolicy: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.format.policy.manage',
                apiExposure: 'mediaManagement',
                key: '/formats/policy/:formatCode/deactivate',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'deactivateFormatPolicy'
            },
            addMediaSetEntry: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'addMediaSetEntry'
            },
            updateMediaSetEntry: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries/:entryCode',
                method: 'PATCH',
                controller: 'DefaultMediaStorageController',
                operation: 'updateMediaSetEntry'
            },
            removeMediaSetEntry: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries/:entryCode',
                method: 'DELETE',
                controller: 'DefaultMediaStorageController',
                operation: 'removeMediaSetEntry'
            },
            reorderMediaSetEntries: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries/reorder',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'reorderMediaSetEntries'
            },
            setPrimaryMediaSetEntry: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.set.manage',
                apiExposure: 'mediaManagement',
                key: '/sets/:mediaSetCode/entries/:entryCode/primary',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'setPrimaryMediaSetEntry'
            },
            resolveStorageLocation: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.storage.location.resolve',
                apiExposure: 'mediaManagement',
                key: '/storage/location',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'resolveStorageLocation',
                help: {
                    requestType: 'secured',
                    message: 'Resolves a safe provider storage key and URL for a parsed media descriptor. Raw filesystem paths are rejected.',
                    method: 'POST',
                    url: 'http://host:port/nodics/media/v0/storage/location',
                    body: {
                        folderCode: 'importSources',
                        fileName: 'catalog.xlsx',
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        sizeBytes: 20480
                    }
                }
            },
            uploadMedia: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.upload.create',
                apiExposure: 'mediaManagement',
                bodyParserHandler: 'mediaMultipartUploadBodyParserHandler',
                key: '/storage/upload',
                method: 'POST',
                controller: 'DefaultMediaStorageController',
                operation: 'uploadMedia',
                help: {
                    requestType: 'secured',
                    message: 'Uploads one file through nMedia-owned multipart intake and stores it as nMedia-owned media metadata.',
                    method: 'POST',
                    url: 'http://host:port/nodics/media/v0/storage/upload',
                    body: {
                        folderCode: 'importSources',
                        formatCode: 'importFile',
                        file: '<multipart file field>'
                    }
                },
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['file'],
                                properties: {
                                    file: { type: 'string', format: 'binary' },
                                    folderCode: { type: 'string' },
                                    formatCode: { type: 'string' },
                                    moduleName: { type: 'string' },
                                    schemaName: { type: 'string' },
                                    indexName: { type: 'string' },
                                    keyStrategy: { type: 'string' },
                                    mediaCode: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Stored media metadata descriptor' } }
            },
            deliverMediaContent: {
                secured: false,
                publicAccess: true,
                accessGroups: ['userGroup'],
                apiExposure: 'mediaManagement',
                key: '/content/:mediaCode',
                method: 'GET',
                controller: 'DefaultMediaStorageController',
                operation: 'deliverMediaContent',
                responseHandler: 'mediaContentResponseHandler',
                help: {
                    requestType: 'publicWhenMediaPolicyAllows',
                    message: 'Delivers media content by media code after nMedia access policy validation.',
                    method: 'GET',
                    url: 'http://host:port/nodics/media/v0/content/{mediaCode}'
                },
                parameters: [
                    { name: 'mediaCode', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: { '200': { description: 'Media binary content' } }
            },
            downloadMediaContent: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'media.content.download',
                apiExposure: 'mediaManagement',
                key: '/download/:mediaCode',
                method: 'GET',
                controller: 'DefaultMediaStorageController',
                operation: 'downloadMediaContent',
                responseHandler: 'fileDownloadResponseHandler',
                help: {
                    requestType: 'secured',
                    message: 'Downloads private or public media content by media code after nMedia access policy validation.',
                    method: 'GET',
                    url: 'http://host:port/nodics/media/v0/download/{mediaCode}'
                },
                parameters: [
                    { name: 'mediaCode', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: { '200': { description: 'Media binary download' } }
            }
        },
        referenceLookup: {
            validate: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/references/media/validate',
                method: 'POST',
                controller: 'DefaultMediaReferenceLookupController',
                operation: 'validate',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                additionalProperties: false,
                                required: ['referenceType', 'referenceCode'],
                                properties: {
                                    referenceType: { type: 'string', enum: ['MEDIA', 'MEDIA_SET'] },
                                    referenceCode: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Bounded nMedia reference validation result' } }
            }
        }
    }
};
