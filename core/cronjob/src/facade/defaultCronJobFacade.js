/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    createJob: function (request, callback) {
        return SERVICE.DefaultCronJobService.createJob(request, callback);
    },

    updateJob: function (request, callback) {
        return SERVICE.DefaultCronJobService.updateJob(request, callback);
    },

    runJob: function (request, callback) {
        return SERVICE.DefaultCronJobService.runJob(request, callback);
    },

    startJob: function (request, callback) {
        return SERVICE.DefaultCronJobService.startJob(request, callback);
    },

    stopJob: function (request, callback) {
        return SERVICE.DefaultCronJobService.stopJob(request, callback);
    },

    removeJob: function (request, callback) {
        return SERVICE.DefaultCronJobService.removeJob(request, callback);
    },

    pauseJob: function (request, callback) {
        return SERVICE.DefaultCronJobService.pauseJob(request, callback);
    },

    resumeJob: function (request, callback) {
        return SERVICE.DefaultCronJobService.resumeJob(request, callback);
    }
};