/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    options: {
        isNew: false
    },

    getFullName: function(request, callback) {
        let requestBody = {
            query: {
                _id: '599ffb445c3fe417d02c6d4c'
            }
        };
        let httpRequest = SERVICE.ModuleService.buildRequest('cronjob', 'POST', 'cronjob', requestBody);
        SERVICE.ModuleService.fetch(httpRequest).then((response) => {
            callback(null, response.response.result, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    processNodeFirst: function(processRequest, processResponse, process) {
        console.log('.............processNodeFirst');
        process.nextSuccess(processRequest, processResponse);
    },

    processNodeSecond: function(processRequest, processResponse, process) {
        console.log('.............processNodeSecond');
        process.nextSuccess(processRequest, processResponse);
    },

    processNodeThird: function(processRequest, processResponse, process) {
        console.log('.............processNodeThird : ');
        process.nextSuccess(processRequest, processResponse);
    },

    process1NodeSecond: function(processRequest, processResponse, process) {
        console.log('.............process1NodeSecond');
        process.nextSuccess(processRequest, processResponse);
    },

    process1NodeThird: function(processRequest, processResponse, process) {
        console.log('.............process1NodeThird');
        process.nextSuccess(processRequest, processResponse);
    },

    successEnd: function(processRequest, processResponse, process) {
        console.log('.............successEnd');
    },

    errorEnd: function(processRequest, processResponse, process) {
        console.log('.............errorEnd');
    }
};