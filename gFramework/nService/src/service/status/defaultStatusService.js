/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

let assert = require('assert');

module.exports = {

    statusMap: {},

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let statusCodes = SERVICE.DefaultFilesLoaderService.loadFiles('/src/utils/statusDefinitions.js');
                Object.keys(statusCodes).forEach(errorCode => {
                    let status = statusCodes[errorCode];
                    assert.ok(status.code, 'Invalid response code for: ' + errorCode + ', it can not be null or empty');
                    assert.ok(status.message, 'Invalid error message for: ' + errorCode + ', it can not be null or empty');
                    this.statusMap[errorCode] = status;
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
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

    updateStatus: function (errorCode, status) {
        this.statusMap[errorCode] = status;
    },

    get: function (errorCode) {
        if (!UTILS.isBlank(this.statusMap[errorCode])) {
            return this.statusMap[code];
        } else {
            throw new CLASSES.NodicsError({
                code: 'ERR_SYS_00000'
            });
        }
    },
};