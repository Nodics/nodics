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

    generateCmsComponentDetailCode: function (request, response) {
        return new Promise((resolve, reject) => {
            if (!request.model.code) request.model.code = request.model.source + '2' + request.model.target.toUpperCaseFirstChar();
            resolve(true);
        });
    },

    setCompDetailSourceForPage: function (request, response) {
        return new Promise((resolve, reject) => {
            let model = request.model;
            if (model.cmsComponents && model.cmsComponents.length > 0) {
                model.cmsComponents.forEach(detail => {
                    if (!detail.source) detail.source = model.code;
                });
            }
            resolve(true);
        });
    },

    setCompDetailSourceForComp: function (request, response) {
        return new Promise((resolve, reject) => {
            let model = request.model;
            if (model.subComponents && model.subComponents.length > 0) {
                model.subComponents.forEach(detail => {
                    if (!detail.source) detail.source = model.code;
                });
            }
            resolve(true);
        });
    }
};