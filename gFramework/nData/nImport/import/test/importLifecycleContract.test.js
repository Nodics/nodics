const assert = require('assert');

/**
 * @module import/test/importLifecycleContract
 * @description Verifies init, core, sample, local, and remote import dispatch lifecycles, including import types, tenant propagation, finalized local processing, and non-finalizing discovery behavior.
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

    console.log('Import lifecycle contract validated for init, core, sample, local, and remote');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
