/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    //Created this class to test if cronJob run process works fine

    runJob: function (definition) {
        return new Promise((resolve, reject) => {
            var today = new Date();
            this.LOG.info('CronJos:', definition.code, ' Started................ : ', today.getHours(), ':', today.getMinutes(), ':', today.getSeconds());
            // console.log('Hey, wait a second!');
            // setTimeout(function () {
            //     console.log('Hey, I am here');
            //     resolve(true);
            // }, 10 * 1000);
            resolve(true);
        });
    },

    stopJob: function (definition) {
        return new Promise((resolve, reject) => {
            var today = new Date();
            this.LOG.info('CronJos:', definition.code, ' Stoped................ : ', today.getHours(), ':', today.getMinutes(), ':', today.getSeconds());
            resolve(true);
        });
    }
};