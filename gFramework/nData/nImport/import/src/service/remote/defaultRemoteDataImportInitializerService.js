const fse = require('fs-extra');

/**
 * @module import/service/remote/DefaultRemoteDataImportInitializerService
 * @description Initializes governed remote imports by validating tenant and active-module scope, staging non-executable data through a configured adapter, and pairing it only with trusted headers owned by active Nodics modules.
 * @layer service
 * @owner import
 * @override Projects customize remote sources and adapters through layered configuration or override this service while preserving transport governance and trusted-header boundaries.
 */
module.exports = {
    /** Standard service initialization contract. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Standard service post-initialization contract. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /** Validates remote source, tenant, active modules, and initializes import diagnostics. */
    validateRequest: function (request, response, process) {
        try {
            request.tenant = request.tenant || CONFIG.get('defaultTenant') || 'default';
            request.options = request.options || {};
            request.remoteImport = request.remoteImport || {};
            if (!NODICS.getActiveTenants().includes(request.tenant)) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import tenant is not active: ' + request.tenant);
            if (!Array.isArray(request.modules) || request.modules.length === 0) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import requires at least one active module');
            const inactiveModules = request.modules.filter(moduleName => !NODICS.isModuleActive(moduleName));
            if (inactiveModules.length > 0) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import modules are not active: ' + inactiveModules.join(', '));
            SERVICE.DefaultRemoteImportTransportService.resolve(request);
            request.data = {};
            SERVICE.DefaultSystemDataImportInitializerService.initImportRun(request);
            process.nextSuccess(request, response);
        } catch (error) {
            process.error(request, response, error);
        }
    },

    /** Prepares isolated staging and finalized output paths under the active server module. */
    preparePaths: function (request, response, process) {
        const runId = String(request.importRun.runId).replace(/[^A-Za-z0-9_.-]/g, '_');
        const rootPath = NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/import/remote/' + runId;
        request.outputPath = {
            rootPath: rootPath,
            dataPath: rootPath + '/data',
            successPath: rootPath + '/success',
            errorPath: rootPath + '/error'
        };
        process.nextSuccess(request, response);
    },

    /** Clears only the generated finalized-data path for this isolated import run. */
    flushOutputFolder: function (request, response, process) {
        fse.remove(request.outputPath.dataPath).then(() => process.nextSuccess(request, response)).catch(error => process.error(request, response, error));
    },

    /** Stages governed remote data and exposes it through the standard local input-path contract. */
    stageRemoteData: function (request, response, process) {
        SERVICE.DefaultRemoteImportTransportService.stage(request).then(stage => {
            request.inputPath = {
                rootPath: stage.rootPath,
                dataPath: stage.rootPath,
                headerPath: null,
                successPath: request.outputPath.successPath,
                errorPath: request.outputPath.errorPath,
                importType: 'remote'
            };
            process.nextSuccess(request, response);
        }).catch(error => process.error(request, response, error));
    },

    /** Loads trusted header definitions from selected active modules, never from the remote source. */
    loadHeaderFileList: function (request, response, process) {
        const headerDataType = request.remoteImportPolicy.headerDataType;
        if (!['init', 'core', 'sample'].includes(headerDataType)) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import headerDataType is not allowed: ' + headerDataType));
            return;
        }
        SERVICE.DefaultImportUtilityService.getSystemDataHeaders(request.modules, headerDataType).then(headers => {
            request.data.headerFiles = headers;
            if (request.importRun) request.importRun.summary.headerFilesDiscovered = Object.keys(headers || {}).length;
            process.nextSuccess(request, response);
        }).catch(error => process.error(request, response, error));
    }
};
