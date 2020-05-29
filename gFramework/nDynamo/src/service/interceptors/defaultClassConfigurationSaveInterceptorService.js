/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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
    checkIfModuleActive: function (request, response) {
        return new Promise((resolve, reject) => {
            let moduleName = request.model.moduleName;
            if (NODICS.isModuleActive(moduleName)) {
                resolve(true);
            } else {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invalid moduleName, it should not be null or inactive'));
            }
        });
    },

    removeBody: function (request, response) {
        return new Promise((resolve, reject) => {
            if (response.model && response.model.result && response.model.result.body) {
                delete response.model.result.body;
            }
            resolve(true);
        });
    }
};