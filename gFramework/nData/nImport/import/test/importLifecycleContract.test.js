/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

/**
 * @module import/test/importLifecycleContract
 * @description Verifies init, core, sample, local, remote, and media import lifecycles, including import types, tenant propagation, finalized local processing, validation-only media staging, and non-finalizing discovery behavior.
 * @layer test
 * @owner import
 * @override Project modules may extend import initializer pipelines and fixtures while preserving these public lifecycle contracts.
 */

global.CONFIG = {
    get: function (key) {
        if (key === 'defaultTenant') return 'default';
        if (key === 'data') return { dataDirName: 'temp' };
        return undefined;
    }
};
global.NODICS = {
    getServerPath: function () { return '/tmp/nodics-server'; }
};

const importServiceDefinition = require('../src/service/import/defaultImportService');

function createHarness() {
    const calls = [];
    const service = Object.assign({}, importServiceDefinition);
    global.SERVICE = {
        DefaultImportService: service,
        DefaultPipelineService: {
            start: function (pipelineName, request) {
                calls.push({ pipelineName: pipelineName, request: request });
                if (pipelineName === 'systemDataImportInitializerPipeline') {
                    request.importRun = { runId: request.dataType + '_run', summary: {}, failures: [], validationErrors: [] };
                    return Promise.resolve({ code: 'SUC_IMP_READY' });
                }
                if (pipelineName === 'localDataImportInitializerPipeline') {
                    request.importRun = request.importRun || { runId: 'local_run', summary: {}, failures: [], validationErrors: [] };
                    request.outputPath = request.outputPath || { rootPath: '/tmp/nodics-local-output' };
                    return Promise.resolve({ code: 'SUC_IMP_READY' });
                }
                if (pipelineName === 'remoteDataImportInitializerPipeline') {
                    request.importRun = request.importRun || { runId: 'remote_run', summary: {}, failures: [], validationErrors: [] };
                    request.outputPath = {
                        rootPath: '/tmp/nodics-remote-output',
                        dataPath: '/tmp/nodics-remote-output/data',
                        successPath: '/tmp/nodics-remote-output/success',
                        errorPath: '/tmp/nodics-remote-output/error'
                    };
                    return Promise.resolve({ code: 'SUC_IMP_REMOTE_READY' });
                }
                if (pipelineName === 'processDataImportPipeline') {
                    return Promise.resolve({ code: 'SUC_IMP_PROCESSED' });
                }
                return Promise.reject(new Error('Unexpected pipeline: ' + pipelineName));
            }
        },
        DefaultRemoteImportTransportService: { cleanup: function () { return Promise.resolve(true); } }
    };
    global.SERVICE.DefaultMediaImportDefinitionService = {
        prepare: function (request) {
            request.importRun = request.importRun || { runId: 'media_run', summary: {}, failures: [], validationErrors: [] };
            return Promise.resolve({
                inputPath: {
                    rootPath: '/tmp/nodics-media-input',
                    dataPath: '/tmp/nodics-media-input/data',
                    headerPath: '/tmp/nodics-media-input/headers',
                    successPath: '/tmp/nodics-media-input/success',
                    errorPath: '/tmp/nodics-media-input/error',
                    importType: 'media'
                },
                outputPath: {
                    rootPath: '/tmp/nodics-media-output',
                    dataPath: '/tmp/nodics-media-output/data',
                    successPath: '/tmp/nodics-media-output/success',
                    errorPath: '/tmp/nodics-media-output/error'
                },
                mediaSource: { mediaCode: request.mediaCode || request.source && request.source.mediaCode },
                importDefinition: { code: request.definitionCode || 'tenantCsv' },
                stagedFile: { fileName: 'tenantData.csv' }
            });
        }
    };
    return { service: service, calls: calls };
}

(async function () {
    for (const type of ['init', 'core', 'sample']) {
        const harness = createHarness();
        const operation = 'import' + type.charAt(0).toUpperCase() + type.slice(1) + 'Data';
        const result = await harness.service[operation]({ tenant: 'nodicsTest', modules: ['profile'] });
        assert.deepStrictEqual(harness.calls.map(call => call.pipelineName), ['systemDataImportInitializerPipeline', 'processDataImportPipeline']);
        assert.strictEqual(harness.calls[0].request.dataType, type);
        assert.strictEqual(harness.calls[1].request.inputPath.dataType, type);
        assert.strictEqual(harness.calls[1].request.tenant, 'nodicsTest');
        assert.strictEqual(result.importRun.status, 'COMPLETED');
    }

    let harness = createHarness();
    let localResult = await harness.service.importLocalData({
        importFinalizeData: true,
        inputPath: { rootPath: '/tmp/nodics-local-input' }
    });
    assert.deepStrictEqual(harness.calls.map(call => call.pipelineName), ['localDataImportInitializerPipeline', 'processDataImportPipeline']);
    assert.strictEqual(harness.calls[0].request.dataType, 'local');
    assert.strictEqual(harness.calls[1].request.tenant, 'default');
    assert.strictEqual(harness.calls[1].request.inputPath.dataType, 'local');
    assert.strictEqual(localResult.importRun.status, 'COMPLETED');

    harness = createHarness();
    await harness.service.importLocalData({
        importFinalizeData: false,
        inputPath: { rootPath: '/tmp/nodics-local-input' }
    });
    assert.deepStrictEqual(harness.calls.map(call => call.pipelineName), ['localDataImportInitializerPipeline']);
    assert.strictEqual(harness.calls[0].request.dataType, 'local');

    harness = createHarness();
    const remoteRequest = { tenant: 'nodicsTest', modules: ['profile'], remoteImport: { source: 'projectSource' } };
    const remoteResult = await harness.service.importRemoteData(remoteRequest);
    assert.deepStrictEqual(harness.calls.map(call => call.pipelineName), ['remoteDataImportInitializerPipeline', 'processDataImportPipeline']);
    assert.strictEqual(harness.calls[1].request.inputPath.dataType, 'remote');
    assert.strictEqual(remoteResult.importRun.status, 'COMPLETED');

    harness = createHarness();
    const discoveryRequest = { modules: ['profile'], remoteImport: { source: 'projectSource' }, importFinalizeData: false };
    await harness.service.importRemoteData(discoveryRequest);
    assert.deepStrictEqual(harness.calls.map(call => call.pipelineName), ['remoteDataImportInitializerPipeline']);
    assert.strictEqual(discoveryRequest.dataType, 'remote');

    harness = createHarness();
    const mediaValidation = await harness.service.importMediaData({
        tenant: 'nodicsTest',
        mediaCode: 'tenant-upload',
        definitionCode: 'tenantCsv',
        options: { validateOnly: true }
    });
    assert.deepStrictEqual(harness.calls.map(call => call.pipelineName), ['localDataImportInitializerPipeline']);
    assert.strictEqual(harness.calls[0].request.dataType, 'media');
    assert.strictEqual(mediaValidation.validationOnly, true);
    assert.strictEqual(mediaValidation.validationPassed, true);
    assert.strictEqual(mediaValidation.validationErrorCount, 0);
    assert.strictEqual(mediaValidation.finalizer.code, 'SUC_IMP_READY');
    assert.strictEqual(mediaValidation.importRun.status, 'VALIDATED');

    harness = createHarness();
    const mediaResult = await harness.service.importMediaData({
        tenant: 'nodicsTest',
        mediaCode: 'tenant-upload',
        definitionCode: 'tenantCsv'
    });
    assert.deepStrictEqual(harness.calls.map(call => call.pipelineName), ['localDataImportInitializerPipeline', 'processDataImportPipeline']);
    assert.strictEqual(harness.calls[0].request.dataType, 'media');
    assert.strictEqual(harness.calls[1].request.inputPath.dataType, undefined);
    assert.strictEqual(harness.calls[1].request.inputPath.dataPath, '/tmp/nodics-media-output/data');
    assert.strictEqual(mediaResult.importRun.status, 'COMPLETED');

    console.log('Import lifecycle contract validated for init, core, sample, local, remote, and media');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
