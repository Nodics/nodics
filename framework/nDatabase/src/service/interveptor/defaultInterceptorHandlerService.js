/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    executeInterceptors: function (request, response, preInterceptorList) {
        return new Promise((resolve, reject) => {
            try {
                if (preInterceptorList.length > 0) {
                    let interceptor = preInterceptorList.shift();
                    let input = {
                        collection: request.collection,
                        model: request.model,
                        interceptor: interceptor
                    }
                    this.executeInterceptor(input).then(success => {
                        this.executeInterceptors(request, response, preInterceptorList).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        })
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

    executeInterceptor: function (input) {
        let serviceName = input.interceptor.handler.substring(0, input.interceptor.handler.indexOf('.'));
        let functionName = input.interceptor.handler.substring(input.interceptor.handler.indexOf('.') + 1, input.interceptor.handler.length);
        return SERVICE[serviceName][functionName](input.model);
    }
};