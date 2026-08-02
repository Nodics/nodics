/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/mediaImportFinalizedValidationContract
 * @description Validates finalized nImport media validation reports and validate-only failure projection.
 * @layer test
 * @owner import
 * @override Extend when media import finalization changes validation report shape or pipeline handoff behavior.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const importService = require('../src/service/import/defaultImportService');

/**
 * Validates finalized media import validation reports and validate-only import failure projection.
 *
 * @returns {Promise<void>} Resolves after all finalized validation assertions pass.
 */
async function main() {
    let workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-media-import-validation-'));
    let dataPath = path.join(workspace, 'data');
    fs.mkdirSync(dataPath, {
        recursive: true
    });
    fs.writeFileSync(path.join(dataPath, 'tenantData.js'), [
        'module.exports = {',
        '  header: {',
        '    options: {',
        '      owningModule: "profile",',
        '      moduleName: "profile",',
        '      schemaName: "tenant",',
        '      operation: "saveAll"',
        '    },',
        '    query: {',
        '      code: "$code"',
        '    }',
        '  },',
        '  models: {',
        '    goodTenant: { code: "goodTenant", active: true },',
        '    missingCodeTenant: { active: true }',
        '  }',
        '};'
    ].join('\n'));

    let request = {
        tenant: 'default',
        outputPath: {
            dataPath: dataPath
        },
        importRun: {
            summary: {},
            validationErrors: []
        }
    };

    let errors = importService.validatePreparedFinalizedImport(request);

    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].code, 'ERR_IMP_VALIDATE_00008');
    assert.strictEqual(errors[0].metadata.recordKey, 'missingCodeTenant');
    assert.strictEqual(errors[0].metadata.propertyName, 'code');
    assert.strictEqual(errors[0].metadata.rowNumber, 2);
    assert.ok(errors[0].message.includes('required property "code"'));
    assert.ok(!errors[0].message.includes('DefaultModelQueryBuilderPipelineService'));
    assert.strictEqual(request.importRun.summary.validationErrors, 1);
    let report = importService.createPreparedFinalizedValidationReport(request, errors);
    assert.strictEqual(report.totalRecords, 2);
    assert.strictEqual(report.validRecords, 1);
    assert.strictEqual(report.invalidRecords, 1);
    assert.strictEqual(report.rows[0].status, 'VALID');
    assert.strictEqual(report.rows[1].status, 'INVALID');
    assert.strictEqual(report.rows[1].rowNumber, 2);
    assert.ok(report.rows[1].howToFix.includes('Add a valid value for "code"'));

    let service = Object.assign({}, importService);
    global.SERVICE = {
        DefaultMediaImportDefinitionService: {
            /**
             * Prepares a deterministic media import workspace for validate-only import assertions.
             *
             * @param {Object} mediaRequest Import request mutated with a synthetic import run.
             * @returns {Promise<Object>} Prepared import workspace paths and source metadata.
             */
            prepare: function (mediaRequest) {
                mediaRequest.importRun = {
                    runId: 'media_validation_run',
                    summary: {},
                    failures: [],
                    validationErrors: []
                };
                return Promise.resolve({
                    inputPath: { rootPath: workspace },
                    outputPath: {
                        rootPath: workspace,
                        dataPath: dataPath,
                        successPath: path.join(workspace, 'success'),
                        errorPath: path.join(workspace, 'error')
                    },
                    mediaSource: { mediaCode: 'tenant-upload' },
                    importDefinition: { code: 'tenantCsv' },
                    stagedFile: { fileName: 'tenantData.csv' }
                });
            }
        },
        DefaultPipelineService: {
            /**
             * Captures the pipeline selected by validate-only media import execution.
             *
             * @param {string} pipelineName Pipeline name requested by the import service.
             * @returns {Promise<Object>} Synthetic pipeline start response.
             */
            start: function (pipelineName) {
                assert.strictEqual(pipelineName, 'localDataImportInitializerPipeline');
                return Promise.resolve({ code: 'SUC_IMP_READY' });
            }
        }
    };

    let mediaValidation = await service.importMediaData({
        tenant: 'default',
        mediaCode: 'tenant-upload',
        definitionCode: 'tenantCsv',
        options: { validateOnly: true }
    });

    assert.strictEqual(mediaValidation.validationOnly, true);
    assert.strictEqual(mediaValidation.validationPassed, false);
    assert.strictEqual(mediaValidation.validationErrorCount, 1);
    assert.strictEqual(mediaValidation.validationErrors[0].recordKey, 'missingCodeTenant');
    assert.strictEqual(mediaValidation.validationReport.totalRecords, 2);
    assert.strictEqual(mediaValidation.validationReport.invalidRecords, 1);
    assert.strictEqual(mediaValidation.validationReport.rows[1].status, 'INVALID');
    assert.strictEqual(mediaValidation.importRun.status, 'FAILED');
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
