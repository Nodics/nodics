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

    createWorkflowCode: function (request, response) {
        return new Promise((resolve, reject) => {
            try {
                if (request.schemaModel.workflows &&
                    Object.keys(request.schemaModel.workflows).length > 0) {
                    if (!request.options) {
                        request.options = {
                            returnModified: true
                        };
                    } else if (!request.options.returnModified) {
                        request.options.returnModified = true;
                    }
                }
                resolve(true);
            } catch (error) {
                reject(new CLASSES.WorkflowError('ERR_WF_00000', 'Error while assiging workflow ref id: ' + CONFIG.get('clusterId')));
            }
        });
    }
};