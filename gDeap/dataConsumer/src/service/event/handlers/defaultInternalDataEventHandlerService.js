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

    handleInternalDataPushEvent: function (event, callback) {
        this.LOG.debug('----------------------------- Internal Event has been Handled');
        console.log(event);
        if (event && !UTILS.isBlank(event)) {
            SERVICE.DefaultPipelineService.start('processInternalDataPushEventPipeline', {
                tenant: event.tenant,
                enterpriseCode: event.enterpriseCode,
                moduleName: event.target,
                header: event.header,
                data: event.data,
                event: event
            }, {}).then(success => {
                callback(null, {
                    success: true,
                    code: 'SUC_EVNT_00000',
                    msg: 'Event processed successfuly',
                    result: {
                        event: event.event
                    }
                });
            }).catch(error => {
                callback({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    error: error,
                    result: {
                        event: event.event
                    }
                });
            });
        } else {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                error: 'Event object can not be null or empty'
            });
        }
    }
};