/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating internal indexer request');
        if (!request.header) {
            process.error(request, response, 'Request contain invalid header data');
        } else if (!request.event) {
            process.error(request, response, 'Request contain invalid event data');
        } else {
            process.nextSuccess(request, response);
        }
    },

    prepareHeader: function (request, response, process) {
        this.LOG.debug('Building options for internal indexer');
        let tmpHeader = {};
        let header = request.header;
        if (header.schemaName) {
            tmpHeader.options = {
                schemaName: header.schemaName,
                operation: header.operation || 'save',
                moduleName: request.moduleName
            };
        } else if (header.indexName) {
            tmpHeader.options = {
                indexName: header.indexName,
                typeName: header.typeName || header.indexName,
                operation: header.operation || 'doSave',
                moduleName: request.moduleName,
                finalizeData: header.finalizeData || false
            };
        }
        if (!UTILS.isBlank(tmpHeader)) {
            request.header = tmpHeader;
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, {
                success: false,
                code: 'ERR_SRCH_00010',
                error: 'Event contain invalid header'
            });
        }
    },

    prepareInputPath: function (request, response, process) {
        this.LOG.debug('Preparing input data path');
        request.inputPath = {};
        process.nextSuccess(request, response);
    },

    prepareOutputPath: function (request, response, process) {
        this.LOG.debug('Preparing output file path');
        let rootPath = NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/import/' + request.event.event;
        request.outputPath = {
            rootPath: rootPath,
            dataPath: rootPath + '/data',
            successPath: rootPath + '/success',
            errorPath: rootPath + '/error',
            fileName: request.event.event + 'EventData',
            timestampPostFix: true
        };
        process.nextSuccess(request, response);
    },

    flushOutputFolder: function (request, response, process) {
        if (request.header.options.finalizeData) {
            this.LOG.debug('Cleaning output directory : ' + request.outputPath.dataPath);
            fse.remove(request.outputPath.dataPath).then(() => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    processData: function (request, response, process) {
        try {
            let header = request.header;
            if (header.options.schemaName) {
                SERVICE.DefaultPipelineService.start('schemaDataHandlerPipeline', {
                    tenant: request.tenant,
                    moduleName: request.moduleName,
                    header: request.header,
                    models: [request.event.data],
                    inputPath: request.inputPath,
                    outputPath: request.outputPath
                }, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                SERVICE.DefaultPipelineService.start('indexerDataHandlerPipeline', {
                    tenant: request.tenant,
                    moduleName: request.moduleName,
                    header: request.header,
                    models: [request.event.data],
                    inputPath: request.inputPath,
                    outputPath: request.outputPath
                }, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    importFinalizeData: function (request, response, process) {
        try {
            if (request.header.options.finalizeData) {
                SERVICE.DefaultImportService.processImportData({
                    tenant: request.tenant,
                    inputPath: {
                        rootPath: request.outputPath.rootPath,
                        dataPath: request.outputPath.dataPath,
                        successPath: request.outputPath.successPath,
                        errorPath: request.outputPath.errorPath
                    }
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
                process.nextSuccess(request, response);
            } else {
                process.nextSuccess(request, response);
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        response.success.msg = SERVICE.DefaultStatusService.get(response.success.code || 'SUC_SYS_00000').message;
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};