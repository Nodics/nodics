/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    options: {
        isNew: true
    },
    runJob: function(definition, cronJob) {
        this.triggerEventHandlerJob(definition, () => {
            DAO.CronJobDao.update({
                tenant: definition.tenant,
                models: [definition]
            }).then(response => {
                console.log('   INFO: Job : executed successfuly');
            }).catch(error => {
                console.log('   ERROR: Job : executed with error : ', error);
            });
        });
    },
    triggerEventHandlerJob: function(definition, callback) {
        let nemsUrl = SERVICE.ModuleService.buildRequest('nems', 'GET', 'event/process', {}, null, true);
        console.log('   INFO: Triggering Job : ', nemsUrl);
        SERVICE.ModuleService.fetch(nemsUrl, (error, response) => {
            console.log('   INFO: Events processed with response : ', response);
            let logMessage = '';
            if (error) {
                logMessage = error.toString();
            } else {
                logMessage = JSON.stringify(response);
            }
            DAO.CronJobLogDao.save({
                tenant: definition.tenant,
                models: [{
                    log: logMessage
                }]
            }).then(models => {
                if (!definition.logs) {
                    definition.logs = [];
                }
                if (models.length > 0) definition.logs.push(models[0]._id);
                definition.lastResult = ENUMS.CronJobStatus.SUCCESS;
                definition.state = ENUMS.CronJobState.FINISHED;
                callback();
            }).catch(error => {
                definition.lastResult = ENUMS.CronJobStatus.ERROR;
                definition.state = ENUMS.CronJobState.FINISHED;
                callback();
            });
        });
    }
};