/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    activateJob: function (request, response) {
        let _self = this;
        return new Promise((resolve, reject) => {
            resolve(true);
            try {
                let model = request.model;
                if (model.active && model.state === ENUMS.CronJobState.NEW.key) {
                    SERVICE.DefaultCronJobService.getCronJobContainer().createJobs({
                        tenant: request.tenant,
                        definitions: [model]
                    }).then(success => {
                        SERVICE.DefaultCronJobService.getCronJobContainer().startJobs(request.tenant, [model.code]).then(success => {
                            _self.LOG.info('Successfully started job: ', model.code);
                        }).catch(error => {
                            _self.LOG.error('Failed to start job: ', model.code);
                            _self.LOG.error(error);
                        });
                    }).catch(error => {
                        _self.LOG.error('Failed to create job: ', model.code);
                        _self.LOG.error(error);
                    });
                }
            } catch (error) {
                _self.LOG.error('Failed to start job: ', request.model.code);
                _self.LOG.error(error);
            }
        });
    },
};