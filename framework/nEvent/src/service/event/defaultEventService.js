/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    handleEvent: function (request) {
        let event = request.event;
        if (NODICS.getModule(event.target).eventService.emit(event.event, event)) {
            return Promise.resolve({
                success: true,
                code: 'SUC_EVNT_00000',
                msg: 'There is no Listener register for event ' + event.event + ' in module ' + event.target
            });
        } else {
            if (CONFIG.get('event').ignoreIfNoLister) {
                return Promise.resolve({
                    success: true,
                    code: 'SUC_EVNT_00000',
                    msg: 'There is no Listener register for event ' + event.event + ' in module ' + event.target
                });
            } else {
                return Promise.resolve({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    msg: 'There is no Listener register for event ' + event.event + ' in module ' + event.target
                });
            }
        }
    },
    /*
        prepareURL: function (eventDef) {
            return SERVICE.DefaultModuleService.buildRequest({
                moduleName: 'nems',
                methodName: 'put',
                apiName: '/event/push',
                requestBody: eventDef,
                isJsonResponse: true,
                header: {
                    enterpriseCode: eventDef.enterpriseCode || 'default'
                }
            });
        },
    
        publish: function (request) {
            return new Promise((resolve, reject) => {
                if (NODICS.getServerState() === 'started' && NODICS.getActiveChannel() !== 'test' &&
                    !NODICS.isNTestRunning() && CONFIG.get('event').publishAllActive) {
                    this.LOG.debug('Publishing event to event server');
                    SERVICE.DefaultModuleService.fetch(this.prepareURL(request.event)).then(response => {
                        if (response.success) {
                            resolve({
                                success: true,
                                code: 'SUC_EVNT_00000',
                                result: response
                            });
                        } else {
                            reject({
                                success: false,
                                code: 'ERR_EVNT_00000',
                                error: response
                            });
                        }
                    }).catch(error => {
                        reject({
                            success: false,
                            code: 'ERR_EVNT_00000',
                            error: error
                        });
                    });
                } else {
                    reject({
                        success: false,
                        code: 'ERR_EVNT_00002',
                    });
                }
            });
        }
    */
};