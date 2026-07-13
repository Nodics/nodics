/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/schemas/schemas
 * @description Defines nData schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    import: {
        importRun: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: false
            },
            router: {
                enabled: true
            },
            tenants: ['default'],
            definition: {
                runId: {
                    type: 'string',
                    required: true,
                    description: 'Unique import run identifier'
                },
                status: {
                    type: 'string',
                    required: true,
                    description: 'Current import run status'
                },
                dataType: {
                    type: 'string',
                    required: false,
                    description: 'Import data type such as init, core, sample, local, or remote'
                },
                tenant: {
                    type: 'string',
                    required: false,
                    description: 'Tenant used for the import run'
                },
                modules: {
                    type: 'array',
                    required: false,
                    description: 'Modules requested for the import run'
                },
                requestedBy: {
                    type: 'string',
                    required: false,
                    description: 'User or process that started the import run'
                },
                correlationId: {
                    type: 'string',
                    required: false,
                    description: 'Correlation id from the triggering request or event'
                },
                startedAt: {
                    type: 'string',
                    required: false,
                    description: 'Import run start timestamp'
                },
                finishedAt: {
                    type: 'string',
                    required: false,
                    description: 'Import run finish timestamp'
                },
                durationMs: {
                    type: 'int',
                    required: false,
                    description: 'Import run duration in milliseconds'
                },
                summary: {
                    type: 'object',
                    required: false,
                    description: 'Import counters and aggregate summary'
                },
                dataFiles: {
                    type: 'object',
                    required: false,
                    description: 'Discovered, matched, and unmatched import data files'
                },
                headers: {
                    type: 'array',
                    required: false,
                    description: 'Import headers discovered for this run'
                },
                failures: {
                    type: 'array',
                    required: false,
                    description: 'Normalized import failures with context'
                },
                validationErrors: {
                    type: 'array',
                    required: false,
                    description: 'Validation errors collected before import processing'
                },
                failureCount: {
                    type: 'int',
                    required: false,
                    description: 'Number of recorded import failures'
                },
                validationErrorCount: {
                    type: 'int',
                    required: false,
                    description: 'Number of recorded validation errors'
                }
            }
        }
    }
};
