/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/service/indexer/defaultIndexerService
 * @description Implements nSearch default indexer service business behavior and extension logic.
 * @layer service
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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

    /**

     * Runs pre-processing logic for pare indexer.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    prepareIndexer: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let indexerCode = request.indexerCode;
                let indexName = request.indexName;
                this.get({
                    tenant: request.tenant,
                    query: {
                        code: indexerCode
                    }
                }).then(success => {
                    if (success.result && success.result.length > 0) {
                        if (success.result.length === 1) {
                            let indexerConfig = success.result[0];
                            if (indexerConfig.target.indexName === indexName) {
                                request.indexerConfig = indexerConfig;
                                SERVICE.DefaultPipelineService.start('indexerInitializerPipeline', request, {}).then(success => {
                                    resolve(success);
                                }).catch(error => {
                                    reject(error);
                                });
                            } else {
                                reject(new CLASSES.SearchError('ERR_SRCH_00011'));
                            }
                        } else {
                            reject(new CLASSES.SearchError('ERR_SRCH_00012'));
                        }
                    } else {
                        reject(new CLASSES.SearchError('ERR_SRCH_00013'));
                    }
                }).catch(error => {
                    reject(new CLASSES.SearchError(error));
                });
            } catch (error) {
                reject(new CLASSES.SearchError(error));
            }
        });
    }
};