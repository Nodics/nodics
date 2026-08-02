/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/config/properties
 * @description Defines layered import processing limits, error defaults, and the disabled-by-default governed remote source and transport registry.
 * @layer config
 * @owner import
 * @override Projects enable and register remote sources and adapters in later configuration layers without changing framework defaults.
 */
module.exports = {
    data: {
        dataImportPhasesLimit: 5,
        finalizeImportDataAsync: true,
        importDataConvertEncoding: 'utf8',
        readBufferSize: 1024,
        stopImportOnFailure: false,
        batchImport: {
            enabled: false,
            size: 100
        },
        headerBatchSize: 0,
        importGovernance: {
            duplicateProtection: true,
            duplicateStatuses: ['COMPLETED', 'VALIDATED'],
            retry: {
                maxAttempts: 0
            },
            rollback: {
                enabled: true
            }
        },
        dataReleases: {
            allowedContractVersions: [1],
            maximumFilesPerRelease: 1024,
            maximumModulesPerRun: 256,
            allowDowngrade: false,
            types: {
                init: {
                    enabled: true,
                    operatorExecution: true
                },
                core: {
                    enabled: true,
                    operatorExecution: true
                },
                sample: {
                    enabled: false,
                    operatorExecution: false
                }
            }
        },
        contentPacks: {
            enabled: false,
            allowedContractVersions: [1],
            cleanupStaging: true,
            stagingDirectory: 'import/content-packs',
            packs: {
                nodicsDocumentation: {
                    enabled: true,
                    manifestPack: 'nodicsdocs',
                    source: {
                        type: 'LOCAL_SIBLING',
                        repositoryName: 'nodicsdocs',
                        contentPath: 'data/core',
                        manifestPath: 'manifest/generated-content-pack.json'
                    },
                    updatePolicy: {
                        allowDowngrade: false,
                        sameVersionContentChange: 'REJECT'
                    },
                    presentation: {
                        title: 'Nodics documentation',
                        unavailableMessage: 'Documentation has not been installed for this environment.',
                        disabledMessage: 'Documentation imports are not enabled for this environment.',
                        importAction: 'Import documentation',
                        updateAction: 'Update documentation',
                        retryAction: 'Retry import'
                    }
                },
                axisDocumentation: {
                    enabled: true,
                    manifestPack: 'nodicsaxis',
                    source: {
                        type: 'LOCAL_SIBLING',
                        repositoryName: 'nodicsaxis',
                        contentPath: 'data/core',
                        manifestPath: 'manifest/docs-content-pack.json'
                    },
                    updatePolicy: {
                        allowDowngrade: false,
                        sameVersionContentChange: 'REJECT'
                    },
                    presentation: {
                        title: 'Nodics Axis documentation',
                        unavailableMessage: 'Nodics Axis documentation has not been installed for this environment.',
                        disabledMessage: 'Documentation imports are not enabled for this environment.',
                        importAction: 'Import Nodics Axis documentation',
                        updateAction: 'Update Nodics Axis documentation',
                        retryAction: 'Retry import'
                    }
                }
            }
        },
        remoteImport: {
            enabled: false,
            defaultTransport: null,
            defaultHeaderDataType: 'core',
            cleanupStaging: true,
            policy: {
                timeoutMs: 30000,
                retries: 0,
                maxFiles: 100,
                maxFileBytes: 10485760,
                maxTotalBytes: 104857600,
                allowedExtensions: ['json', 'csv', 'xlsx'],
                requireChecksums: true
            },
            transports: {},
            sources: {}
        }
    },

    defaultErrorCodes: {
        DataImportError: 'ERR_IMP_00000'
    }
};
