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

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating validator update request');
        let data = request.data;
        if (!data.models || data.models.length <= 0) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00001', 'Validator list can not be null or empty'));
        } else if (!request.tenant) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00001', 'Validator tenant can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadValidator: function (request, response, process) {
        this.LOG.debug('Fatching updated validator object : ' + request.code);
        try {
            let event = request.event;
            let data = event.data;
            if (data.models && data.models.length > 0) {
                let query = {};
                let schemaModel = NODICS.getModels(request.moduleName, request.tenant)[data.modelName];
                if (data.propertyName === '_id') {
                    data.models = data.models.map(id => {
                        return SERVICE.DefaultDatabaseConfigurationService.toObjectId(schemaModel, id);
                    });
                }
                query[data.propertyName] = {
                    $in: data.models
                };
                SERVICE.DefaultValidatorService.get({
                    authData: request.authData,
                    tenant: request.tenant,
                    searchOptions: {
                        projection: { _id: 0 }
                    },
                    query: query
                }).then(success => {
                    if (success.result && success.result.length > 0) {
                        request.validatorList = success.result;

                        request.validators = success.result;
                        request.validators.forEach(validator => {
                            validator.tenant = request.tenant;
                        });
                        process.nextSuccess(request, response);
                    } else {
                        process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00001', 'None validators found for code: ' + request.code));
                    }
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                process.error(request, response, new CLASSES.WorkflowError('ERR_WF_00000', 'Invalid event data, not contain any models'));
            }
        } catch (error) {
            process.error(request, response, error);
        }
    },

    mergeExisting: function (request, response, process) {
        this.LOG.debug('Adding updated validator with existing one');
        let rawValidators = {};
        rawValidators[request.tenant] = request.validatorList;
        SERVICE.DefaultValidatorService.loadRawValidators(rawValidators);
        process.nextSuccess(request, response);
    },

    publishCleanup: function (request, response, process) {
        this.LOG.debug('Publishing cleanup event');
        let allPromise = [];
        let typedValidators = _.groupBy(request.validatorList, validator => validator.type);
        Object.keys(typedValidators).forEach(type => {
            allPromise.push(SERVICE.DefaultEventService.handleEvent({
                tenant: request.tenant,
                moduleName: request.modelName,
                event: {
                    tenant: request.tenant,
                    event: type + 'ValidatorUpdated',
                    sourceName: request.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: request.moduleName,
                    state: "NEW",
                    type: "SYNC",
                    targetType: ENUMS.TargetType.MODULE.key,
                    active: true,
                    data: typedValidators[type].map(validator => {
                        return validator.item;
                    })
                }
            }));
        });
        if (allPromise.length > 0) {
            Promise.all(allPromise).then(success => {
                response.success = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            response.success = 'None validators found to process';
            process.nextSuccess(request, response);
        }
    }
};