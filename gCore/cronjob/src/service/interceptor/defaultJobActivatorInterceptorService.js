/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/service/interceptor/DefaultJobActivatorInterceptorService
 * @description Activates newly saved cronjob records by creating and starting them in the scheduler pool.
 * @layer service
 * @owner cronjob
 * @override Project modules may override this interceptor to change automatic job activation behavior.
 */
module.exports = {
    /**
     * Creates and starts a newly saved active job whose state is NEW.
     *
     * @param {Object} request Interceptor request containing tenant and model.
     * @param {Object} response Interceptor response context.
     * @returns {Promise<boolean>} Resolves immediately after scheduling best-effort activation.
     */
    activateJob: function (request, response) {
        let _self = this;
        return new Promise((resolve, reject) => {
            resolve(true);
            try {
                let model = request.model;
                if (model.active && model.state === ENUMS.CronJobState.NEW.key) {
                    model.tenant = request.tenant;
                    SERVICE.DefaultCronJobService.getCronJobContainer().createJob(NODICS.getInternalAuthToken(model.tenant), model).then(success => {
                        SERVICE.DefaultCronJobService.getCronJobContainer().startJobs(request.tenant, [model.code]).then(success => {
                            _self.LOG.info(success);
                        }).catch(error => {
                            _self.LOG.error(error);
                        });
                    }).catch(error => {
                        _self.LOG.error(error);
                    });
                }
            } catch (error) {
                _self.LOG.error('Failed to start job: ' + request.model.code);
                _self.LOG.error(error);
            }
        });
    },
};
