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

    handleSuccess: function (request, response, success) {
        try {
            success.code = success.code || 'SUC_SYS_00000';
            success.responseCode = success.responseCode || SERVICE.DefaultStatusService.get(success.code).code;
            success.message = success.message || SERVICE.DefaultStatusService.get(success.code).message;
            response.status(success.responseCode);
            response.json(success);
        } catch (error) {
            this.handleError(request, response, error);
        }

    },

    handleError: function (request, response, error) {
        if (!(error instanceof CLASSES.NodicsError)) {
            error = new CLASSES.NodicsError(error);
        }
        this.LOG.error(error);
        response.status(error.responseCode);
        response.json(error.toJson());
    }
};