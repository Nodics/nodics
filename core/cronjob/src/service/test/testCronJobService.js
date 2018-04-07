/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    //Created this class to test if cronJob run process works fine

    runJob: function(definition) {
        var today = new Date();
        this.LOG.info('CronJos Started................ : ', today.getHours(), ':', today.getMinutes(), ':', today.getSeconds());
    },

    stopJob: function(definition) {
        this.LOG.info('CronJos Started................ stopJob');
    }
};