/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module service/log/DefaultLogService
 * @description Runtime log-level management service. It updates logger levels
 * for named Nodics entities so operators can adjust diagnostics without
 * restarting the node.
 * @layer service
 * @owner nService
 * @override Project modules may override this service to add audit, persistence,
 * tenant scoping, or control-plane approval around log-level changes.
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
     * Changes the log level for a named runtime logger.
     *
     * @param {Object} request Log-level change request.
     * @param {string} request.entityName Logger/entity name.
     * @param {string} request.logLevel Target log level.
     * @returns {Promise<Object>} Status response.
     */
    changeLogLevel: function (request) {
        return new Promise((resolve, reject) => {
            let logger = NODICS.getLogger(request.entityName);
            if (logger) {
                logger.level = request.logLevel;
                this.LOG.debug('Log level have been set successfully');
                resolve({
                    code: 'SUC_SYS_00000',
                    message: 'Log level have been updated successfully'
                });
            } else {
                this.LOG.error('Invalid entity name: ' + request.entityName);
                reject(new CLASSES.NodicsError('ERR_SYS_00000', 'Invalid entity name: ' + request.entityName));
            }
        });
    }
};
