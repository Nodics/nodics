/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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
    isCarrierAvailable: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.get({
                tenant: request.tenant,
                options: {
                    loadActionResponse: false,
                    recursive: true
                },
                query: {
                    code: request.carrierCode
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },
    // Carrier could be de-activated
    // Carrier could reach to retry limit
    getWorkflowCarrier: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.get({
                tenant: request.tenant,
                options: {
                    loadActionResponse: false,
                    recursive: true
                },
                query: {
                    code: request.carrierCode
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    let workflowCarrier = success.result[0];
                    if (workflowCarrier.errorCount >= (CONFIG.get('workflow').itemErrorLimit || 5)) {
                        reject(new CLASSES.WorkflowError('ERR_WF_00003', 'Process has crossed, error limit. Item: ' + workflowCarrier.code + ' requires manual intervation'));
                    } else if (!request.loadInActive && !workflowCarrier.active) {
                        reject(new CLASSES.WorkflowError('ERR_WF_00011', 'Item : ' + workflowCarrier.code + ' has been de-activated'));
                    } else {
                        resolve(workflowCarrier);
                    }
                } else {
                    reject(new CLASSES.WorkflowError('ERR_WF_00011', 'Item : No data found'));
                }
            }).catch(error => {
                reject(error);
            });
        });
    },
    /**
     * This functiona is used to build a new workflow carrier, to initiate with set of data
     * @param {*} request 
     */
    buildWorkflowCarrier: function (request) {
        this.LOG.debug('Creating new workflow carrier');
        let carrier = request.carrier;
        let workflowCarrier = _.merge({}, carrier);
        workflowCarrier.code = workflowCarrier.code || request.workflowCode + '_' + (new Date()).getTime()
        workflowCarrier.active = (carrier.active === undefined) ? true : carrier.active;
        workflowCarrier.event = workflowCarrier.event || {};
        workflowCarrier.event.enabled = workflowCarrier.event.enabled || false;
        workflowCarrier.type = workflowCarrier.type || ENUMS.WorkflowCarrierType.FIXED.key;
        let carrierState = {
            state: ENUMS.WorkflowCarrierState.INIT.key,
            action: request.workflowCode,
            time: new Date(),
            description: 'Carrier initialized'
        };
        workflowCarrier.currentState = carrierState;
        workflowCarrier.states = [carrierState];
        return workflowCarrier;
    },





    // initCarrierItem: function (request) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             SERVICE.DefaultPipelineService.start('initWorkflowCarrierPipeline', request, {}).then(success => {
    //                 resolve(success);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } catch (error) {
    //             reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
    //         }
    //     });
    // },

    // /**
    //  * This function is used to perform an action for item. If action is manual, action response is required
    //  * {
    //  *  decision: 'Decision that has been taken',
    //  *  feedback: 'Either json object or simple message'
    //  * }
    //  * @param {*} request 
    //  */
    // executeAction: function (request) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             SERVICE.DefaultPipelineService.start('executeWorkflowActionPipeline', request, {}).then(success => {
    //                 resolve(success);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } catch (error) {
    //             reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
    //         }
    //     });
    // },


    // //==============================================================================================
    // addItemToCarrier: function (request) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             SERVICE.DefaultPipelineService.start('fillWorkflowCarrierPipeline', request, {}).then(success => {
    //                 resolve(success);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } catch (error) {
    //             reject(new CLASSES.WorkflowError('Facing issue while adding item into carrier'));
    //         }
    //     });
    // },

    // /**
    //  * This function is used to pause any carrier for process
    //  * @param {*} request 
    //  */
    // blockCarrier: function (request) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             SERVICE.DefaultPipelineService.start('blockWorkflowCarrierPipeline', request, {}).then(success => {
    //                 resolve(success);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } catch (error) {
    //             reject(new CLASSES.WorkflowError('Facing issue while initializing pause carrier process'));
    //         }
    //     });
    // },

    // /**
    //  * This function is used to pause any carrier for process
    //  * @param {*} request 
    //  */
    // releaseCarrier: function (request) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             SERVICE.DefaultPipelineService.start('releaseWorkflowCarrierPipeline', request, {}).then(success => {
    //                 resolve(success);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } catch (error) {
    //             reject(new CLASSES.WorkflowError('Facing issue while initializing pause carrier process'));
    //         }
    //     });
    // },

    // /**
    //  * This function is used to pause any carrier for process
    //  * @param {*} request 
    //  */
    // pauseCarrier: function (request) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             SERVICE.DefaultPipelineService.start('pauseWorkflowCarrierPipeline', request, {}).then(success => {
    //                 resolve(success);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } catch (error) {
    //             reject(new CLASSES.WorkflowError('Facing issue while initializing pause carrier process'));
    //         }
    //     });
    // },

    // /**
    //  * This function is used to resume any paused carrier for process
    //  * @param {*} request 
    //  */
    // resumeCarrier: function (request) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             request.loadInActive = true;
    //             SERVICE.DefaultPipelineService.start('resumeWorkflowCarrierPipeline', request, {}).then(success => {
    //                 resolve(success);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } catch (error) {
    //             reject(new CLASSES.WorkflowError('Facing issue while initializing resume carrier process'));
    //         }
    //     });
    // },

    // /**
    // * This funtion is used to assign item to next qalified action, based on evaluated channels 
    // * @param {*} request 
    // */
    // nextAction: function (request) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             SERVICE.DefaultPipelineService.start('nextWorkflowActionPipeline', request, {}).then(success => {
    //                 resolve(success);
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } catch (error) {
    //             reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
    //         }
    //     });
    // },

    // getWorkflowChain: function (request) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             request.loadHead = true;
    //             SERVICE.DefaultPipelineService.start('loadWorkflowChainPipeline', request, {}).then(success => {
    //                 resolve({
    //                     code: 'SUC_SYS_00000',
    //                     result: success
    //                 });
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } catch (error) {
    //             reject(new CLASSES.WorkflowError('Facing issue while initializing init item process'));
    //         }
    //     });
    // },



    // handleItemChangeEvent: function (request) {
    //     return new Promise((resolve, reject) => {
    //         let event = request.event;
    //         let data = event.data;
    //         let allPromises = [];
    //         data.forEach(carrier => {
    //             allPromises.push(this.initCarrierItem(_.merge({
    //                 authData: request.authData,
    //                 tenant: event.tenant || carrier.tenant || request.tenant
    //             }, carrier)));
    //         });
    //         if (allPromises.length > 0) {
    //             SERVICE.DefaultNodicsPromiseService.all(allPromises).then(success => {
    //                 resolve({
    //                     result: success.success,
    //                     errors: success.errors
    //                 });
    //             }).catch(error => {
    //                 reject(error);
    //             });
    //         } else {
    //             resolve({});
    //         }
    //     });
    // },

};