/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    blockNTestSave: function (model, options) {
        return new Promise((resolve, reject) => {
            if (NODICS.isNTestRunning()) {
                reject('Save operation not allowed, while running N-Test cases');
            } else {
                resolve(true);
            }
        });
    },

    publishModifiedEvent: function (model, options) {
        return new Promise((resolve, reject) => {
            if (NODICS.getActiveChannel() !== 'test' &&
                NODICS.isNTestRunning() &&
                CONFIG.get('event').publishAllActive &&
                options.collection.rawSchema.event) {
                let event = {
                    enterpriseCode: model.enterpriseCode,
                    event: 'save',
                    source: options.moduleName,
                    target: options.moduleName,
                    state: "NEW",
                    type: "ASYNC",
                    params: {
                        modelName: options.collection.modelName,
                        schemaName: options.collection.schemaName
                    }
                };
                this.LOG.debug('Pushing event for item created : ', options.collection.rawSchema);
                SERVICE.DefaultEventService.publish(event).then(success => {
                    this.LOG.debug('Modification event for model: ', options.collection.modelName, ' published');
                }).catch(error => {
                    this.LOG.error('While publishing model update event: ', error);
                });
            }
            resolve(true);
        });
    }
};