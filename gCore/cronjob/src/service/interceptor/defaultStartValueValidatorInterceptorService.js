/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/service/interceptor/DefaultStartValueValidatorInterceptorService
 * @description Normalizes cronjob start and end values into Date instances before persistence.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this interceptor to add stricter schedule date validation.
 */
module.exports = {
    /**
     * Converts missing or string start/end schedule values into Date objects.
     *
     * @param {Object} request Interceptor request containing `model`.
     * @param {Object} response Interceptor response context.
     * @returns {Promise<boolean>} Resolves when date normalization succeeds.
     */
    convertToDate: function (request, response) {
        return new Promise((resolve, reject) => {
            try {
                if (!request.model.start) {
                    request.model.start = new Date();
                } else if (!(request.model.start instanceof Date)) {
                    request.model.start = new Date(request.model.start);
                }
                if (request.model.end && !(request.model.end instanceof Date)) {
                    request.model.end = new Date(request.model.end);
                }
                resolve(true);
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_JOB_00000'));
            }
        });
    },
};
