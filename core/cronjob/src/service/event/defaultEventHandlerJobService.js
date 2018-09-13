/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    runJob: function (definition, cronJob) {
        let _self = this;
        this.triggerEventHandlerJob(definition, cronJob, () => {
            SERVICE.DefaultCronJobService.save({
                tenant: definition.tenant,
                models: [definition]
            }).then(response => {
                _self.LOG.debug('Job : executed successfuly');
            }).catch(error => {
                _self.LOG.error('Job : executed with error : ', error);
            });
        });
    },

    prepareURL: function (definition) {
        let connectionType = 'abstract';
        let nodeId = '0';
        if (definition.targetNodeId) {
            connectionType = 'node';
            nodeId = definition.targetNodeId;
        }
        return SERVICE.DefaultModuleService.buildRequest({
            connectionType: connectionType,
            nodeId: nodeId,
            moduleName: 'nems',
            methodName: 'GET',
            apiName: '/event/process',
            requestBody: {},
            isJsonResponse: true,
            header: {
                authToken: NODICS.getModule('cronjob').metaData.authToken
            }
        });
    },

    triggerEventHandlerJob: function (definition, cronJob, callback) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultModuleService.fetch(this.prepareURL(definition, cronJob), (error, response) => {
                    _self.LOG.debug('Events processed with response');
                    let logMessage = '';
                    if (error) {
                        logMessage = error.toString();
                    } else {
                        logMessage = JSON.stringify(response);
                    }
                    SERVICE.DefaultCronJobLogService.save({
                        tenant: definition.tenant,
                        models: [{
                            log: logMessage
                        }]
                    }).then(models => {
                        if (!definition.logs) {
                            definition.logs = [];
                        }
                        if (models.length > 0) {
                            definition.logs.push(models[0]._id);
                        }
                        definition.lastResult = ENUMS.CronJobStatus.SUCCESS;
                        definition.state = ENUMS.CronJobState.FINISHED;
                        resolve();
                    }).catch(error => {
                        definition.lastResult = ENUMS.CronJobStatus.ERROR;
                        definition.state = ENUMS.CronJobState.FINISHED;
                        resolve();
                    });
                });
            } catch (error) {
                _reject(error);
            }
        });
    }
};