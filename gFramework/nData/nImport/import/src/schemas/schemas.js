/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
        dataInstallation: {
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: false
            },
            router: {
                enabled: false
            },
            tenants: ['default'],
            definition: {
                tenant: { type: 'string', required: true, description: 'Tenant owning the installed release state' },
                environment: { type: 'string', required: true, description: 'Environment where the release was installed' },
                moduleName: { type: 'string', required: true, description: 'Active module owning the data release' },
                dataType: { type: 'string', required: true, description: 'Release type: init, core, or sample' },
                version: { type: 'string', required: false, description: 'Installed immutable release version' },
                checksum: { type: 'string', required: false, description: 'Installed immutable release checksum' },
                availableVersion: { type: 'string', required: false, description: 'Release version used by the latest attempt' },
                availableChecksum: { type: 'string', required: false, description: 'Release checksum used by the latest attempt' },
                runId: { type: 'string', required: false, description: 'Successful import run that installed the release' },
                status: { type: 'string', required: true, description: 'Current installation projection status' },
                installedAt: { type: 'string', required: false, description: 'Successful installation timestamp' },
                lastAttemptAt: { type: 'string', required: true, description: 'Latest governed installation attempt timestamp' }
            }
        },
        importDefinition: {
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
            search: {
                enabled: true,
                idPropertyName: 'code'
            },
            tenants: ['default'],
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    description: 'Stable business code for the import definition selected by BackOffice users'
                },
                description: {
                    type: 'string',
                    required: false,
                    description: 'Business-facing explanation of the file shape and target operation'
                },
                enabled: {
                    type: 'bool',
                    required: false,
                    description: 'Whether this import definition may be selected for governed media-backed imports'
                },
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Owning module for the target schema or index contract'
                },
                schemaName: {
                    type: 'string',
                    required: false,
                    description: 'Target schema name when importing records into schema-backed storage'
                },
                indexName: {
                    type: 'string',
                    required: false,
                    description: 'Target search index name when importing records into search projection storage'
                },
                operation: {
                    type: 'string',
                    required: false,
                    description: 'Generated data-handler operation such as saveAll'
                },
                tenants: {
                    type: 'array',
                    required: false,
                    description: 'Tenant scope allowed by this definition; request tenant may narrow but not broaden it'
                },
                dataFilePrefix: {
                    type: 'string',
                    required: true,
                    description: 'Prefix expected on staged data files before their extension'
                },
                query: {
                    type: 'object',
                    required: false,
                    description: 'Import query mapping used by schema data handlers'
                },
                macros: {
                    type: 'object',
                    required: false,
                    description: 'Optional relation macros used by model import processing'
                },
                options: {
                    type: 'object',
                    required: false,
                    description: 'Additional import header options preserved by the existing header contract'
                },
                allowedExtensions: {
                    type: 'array',
                    required: false,
                    description: 'Optional extension allow-list for media files used with this definition'
                },
                active: {
                    type: 'bool',
                    required: false,
                    description: 'Whether the definition is active in the current tenant'
                }
            }
        },
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
                dataReleases: {
                    type: 'array',
                    required: false,
                    description: 'Immutable module release identities validated for this run'
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
                contentPackCode: {
                    type: 'string',
                    required: false,
                    description: 'Stable configured content-pack identifier'
                },
                contentPackVersion: {
                    type: 'string',
                    required: false,
                    description: 'Immutable content-pack release version'
                },
                contentPackContractVersion: {
                    type: 'int',
                    required: false,
                    description: 'Validated content-pack contract version'
                },
                contentPackChecksum: {
                    type: 'string',
                    required: false,
                    description: 'Deterministic checksum of the generated content-pack release'
                },
                sourceName: {
                    type: 'string',
                    required: false,
                    description: 'Client-safe configured source name without filesystem or credential details'
                },
                checksum: {
                    type: 'string',
                    required: false,
                    description: 'Aggregate checksum derived from imported data files when available'
                },
                fingerprint: {
                    type: 'string',
                    required: false,
                    description: 'Deterministic run fingerprint used for duplicate-import detection'
                },
                retry: {
                    type: 'object',
                    required: false,
                    description: 'Retry metadata for governed import retry decisions'
                },
                rollback: {
                    type: 'object',
                    required: false,
                    description: 'Rollback hook status and results for failed import runs'
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
                validationReport: {
                    type: 'object',
                    required: false,
                    description: 'Structured row-level validation report for governed file imports'
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
