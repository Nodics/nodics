/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/service/external/defaultExternalModelsImportEventHandlerService
 * @description Implements nData default external models import event handler service business behavior and extension logic.
 * @layer service
 * @owner nData
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

     * Processes models import event behavior.

     *

     * @param {*} event Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleModelsImportEvent: function (event, callback) {
        try {
            SERVICE.DefaultPipelineService.start('processModelImportPipeline', {
                tenant: event.tenant,
                moduleName: event.moduleName,
                header: event.data.header,
                dataModel: event.data.models
            }, {}).then(success => {
                callback(null, {
                    code: 'SUC_EVNT_00000',
                    result: success
                });
            }).catch(error => {
                callback(error);
            });
        } catch (error) {
            callback(new CLASSES.EventError(error));
        }

    }
};