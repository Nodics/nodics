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
    changeLogLevel: function (request) {
        return new Promise((resolve, reject) => {
            let logger = NODICS.getLogger(request.entityName);
            if (logger) {
                logger.level = request.logLevel;
                this.LOG.debug('Log level have been set successfully');
                resolve({
                    success: true,
                    code: 'SUC_SYS_00000',
                    msg: 'Log level have been updated successfully'
                });
            } else {
                this.LOG.error('Invalid entity name: ' + request.entityName);
                reject({
                    success: false,
                    code: 'ERR_SYS_00000',
                    msg: 'Invalid entity name: ' + request.entityName
                });
            }
        });
    }
};