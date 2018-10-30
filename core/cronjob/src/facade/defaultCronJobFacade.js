/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    createJob: function (request) {
        return SERVICE.DefaultCronJobService.createJob(request);
    },

    updateJob: function (request) {
        return SERVICE.DefaultCronJobService.updateJob(request);
    },

    runJob: function (request) {
        return SERVICE.DefaultCronJobService.runJob(request);
    },

    startJob: function (request) {
        return SERVICE.DefaultCronJobService.startJob(request);
    },

    stopJob: function (request) {
        return SERVICE.DefaultCronJobService.stopJob(request);
    },

    removeJob: function (request) {
        return SERVICE.DefaultCronJobService.removeJob(request);
    },

    pauseJob: function (request) {
        return SERVICE.DefaultCronJobService.pauseJob(request);
    },

    resumeJob: function (request) {
        return SERVICE.DefaultCronJobService.resumeJob(request);
    }
};