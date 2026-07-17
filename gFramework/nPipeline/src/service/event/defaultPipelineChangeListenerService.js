/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module pipeline/service/event/DefaultPipelineChangeListenerService
 * @description Event listener service for runtime pipeline change and removal
 * events. It adapts event callbacks into `DefaultPipelineService` registry
 * updates so behavior overrides can be applied without restarting every caller.
 * @layer service
 * @owner nPipeline
 * @override Project modules may override this listener to add audit, approval,
 * rollback, or tenant filtering while preserving Node-style callback behavior.
 *
 * @property {Object} request.event Runtime pipeline change event.
 * @property {Function} callback Node-style event callback.
 */
module.exports = {

    /**
     * Handles pipeline create/update events.
     *
     * @param {Object} request Nodics event request.
     * @param {Function} callback Node-style callback.
     * @returns {undefined}
     */
    handlePipelineChangeEvent: function (request, callback) {
        try {
            SERVICE.DefaultPipelineService.handlePipelineChangeEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
        }
    },
    /**
     * Handles pipeline removal events.
     *
     * @param {Object} request Nodics event request.
     * @param {Function} callback Node-style callback.
     * @returns {undefined}
     */
    handlePipelineRemovedEvent: function (request, callback) {
        try {
            SERVICE.DefaultPipelineService.handlePipelineRemovedEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle workflow2schema update handler', 'ERR_EVNT_00000'));
        }
    }
};
