/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    executeGetInterceptors: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.interceptorList && options.interceptorList.length > 0) {
                    this.executeInterceptor(options.interceptorList.shift(), {
                        collection: options.collection,
                        query: options.query,
                        options: options.options,
                        result: options.result || {}
                    }).then(success => {
                        this.executeGetInterceptors(options).then(success => {
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

    executeSaveInterceptors: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.interceptorList && options.interceptorList.length > 0) {
                    this.executeInterceptor(options.interceptorList.shift(), {
                        collection: options.collection,
                        options: options.options,
                        query: options.query,
                        originalModel: options.originalModel,
                        model: options.model
                    }).then(success => {
                        this.executeSaveInterceptors(options).then(success => {
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

    executeRemoveInterceptors: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.interceptorList && options.interceptorList.length > 0) {
                    this.executeInterceptor(options.interceptorList.shift(), {
                        collection: options.collection,
                        options: options.options,
                        query: options.query,
                        result: options.result
                    }).then(success => {
                        this.executeRemoveInterceptors(options).then(success => {
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

    executeUpdateInterceptors: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.interceptorList && options.interceptorList.length > 0) {
                    this.executeInterceptor(options.interceptorList.shift(), {
                        collection: options.collection,
                        options: options.options,
                        query: options.query,
                        model: options.model,
                        result: options.result
                    }).then(success => {
                        this.executeUpdateInterceptors(options).then(success => {
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

    executeProcessorInterceptors: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.interceptorList && options.interceptorList.length > 0) {
                    this.executeInterceptor(options.interceptorList.shift(), {
                        request: options.request,
                        response: options.response,
                    }).then(success => {
                        this.executeUpdateInterceptors(options).then(success => {
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