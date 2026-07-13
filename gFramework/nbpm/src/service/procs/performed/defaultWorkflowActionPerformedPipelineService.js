/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');
/**
 * @module gFramework/nbpm/src/service/procs/performed/defaultWorkflowActionPerformedPipelineService
 * @description Implements nbpm default workflow action performed pipeline service business behavior and extension logic.
 * @layer service
 * @owner nbpm
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

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating input for workflow items action performed process');
        process.nextSuccess(request, response);
    },
    /**
     * Runs pre-processing logic for pare models.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @param {*} process Method input.
     * @returns {*} Method result.
     */
    prepareModels: function (request, response, process) {
        this.LOG.debug('Preparing model to update schema items');
        let carrierData = request.data.carrier;
        if (request.schemaModels && request.schemaModels.length > 0) {
            request.schemaModels.forEach(schemaModel => {
                _.merge(schemaModel, {
                    workflow: {
                        carrierCode: carrierData.code,
                        activeHead: carrierData.activeHead,
                        activeAction: carrierData.activeAction,
                        state: carrierData.state,
                        heads: carrierData.heads,
                        actions: carrierData.actions
                    }
                });
            });
        }
        let sourceDetail = carrierData.sourceDetail;
        if (sourceDetail.schemaName) {
            response.targetNode = 'schemaOperation';
            process.nextSuccess(request, response);
        } else if (sourceDetail.indexName) {
            response.targetNode = 'searchOperation';
            process.nextSuccess(request, response);
        } else {
            process.error(request, response, new CLASSES.WorkflowError('Invalid item sourceDetail, could not find operation type'));
        }
    },
    /**
     * Updates schema items information.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @param {*} process Method input.
     * @returns {*} Method result.
     */
    updateSchemaItems: function (request, response, process) {
        this.LOG.debug('Updating schema items for action performed item');
        try {
            request.schemaService.saveAll({
                ignoreWorkflowEvent: true,
                tenant: request.tenant,
                models: request.schemaModels
            }).then(success => {
                process.stop(request, response, success);
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        }
    },
    /**
     * Updates search items information.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @param {*} process Method input.
     * @returns {*} Method result.
     */
    updateSearchItems: function (request, response, process) {
        this.LOG.debug('Updating search item for action performed item');
        process.error(request, response, new CLASSES.WorkflowError('Not yet implemented this functionality updateSearchItem: DefaultWorkflowCarrierAssignedPipelineService'));
        // try {
        //     request.searchService.doSave({
        //         tenant: request.tenant,
        //         model: request.model
        //     }).then(success => {
        //         process.stop(request, response, success);
        //     }).catch(error => {
        //         process.error(request, response, error);
        //     });
        // } catch (error) {
        //     process.error(request, response, new CLASSES.WorkflowError(error, 'while updating schema item'));
        // }
    }
};