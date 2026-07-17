/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
