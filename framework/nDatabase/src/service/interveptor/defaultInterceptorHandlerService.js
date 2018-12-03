/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    executeGetInterceptors: function (interceptorList, options) {
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    this.executeInterceptor(interceptorList.shift(), options).then(success => {
                        this.executeGetInterceptors(interceptorList, options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    executeSaveInterceptors: function (interceptorList, options) {
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    this.executeInterceptor(interceptorList.shift(), options).then(success => {
                        this.executeSaveInterceptors(interceptorList, options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    executeRemoveInterceptors: function (interceptorList, options) {
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    this.executeInterceptor(interceptorList.shift(), options).then(success => {
                        this.executeRemoveInterceptors(interceptorList, options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    executeUpdateInterceptors: function (interceptorList, options) {
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    this.executeInterceptor(interceptorList.shift(), options).then(success => {
                        this.executeUpdateInterceptors(interceptorList, options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    executeProcessorInterceptors: function (interceptorList, options) {
        return new Promise((resolve, reject) => {
            try {
                if (interceptorList && interceptorList.length > 0) {
                    this.executeInterceptor(interceptorList.shift(), options).then(success => {
                        this.executeProcessorInterceptors(interceptorList, options).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },


    executeInterceptor: function (interceptor, options) {
        let serviceName = interceptor.handler.substring(0, interceptor.handler.indexOf('.'));
        let functionName = interceptor.handler.substring(interceptor.handler.indexOf('.') + 1, interceptor.handler.length);
        return SERVICE[serviceName][functionName](options);
    }
};