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

    runUTest: function (requestContext, callback) {
        let input = {
            tenant: requestContext.tenant,
            entCode: requestContext.entCode
        };
        FACADE.TestExecutionFacade.runUTest(input, callback);
    },

    runNTest: function (requestContext, callback) {
        let input = {
            tenant: requestContext.tenant,
            entCode: requestContext.entCode
        };
        FACADE.TestExecutionFacade.runNTest(input, callback);
    }
};