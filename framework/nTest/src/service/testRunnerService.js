/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    runUTest: function(input, callback) {
        let _self = this;
        if (callback) {
            SERVICE.TestExecutorService.executeUTest().then(success => {
                _self.LOG.info('   INFO: U-Test cases Executed successfully');
                callback(null, 'U-Test cases Executed successfully');
            }).catch(error => {
                _self.LOG.error('   ERROR: ', error);
                callback(error);
            });
        } else {
            return SERVICE.TestExecutorService.executeUTest();
        }
    },

    runNTest: function(input, callback) {
        let _self = this;
        if (callback) {
            SERVICE.TestExecutorService.executeNTest().then(success => {
                _self.LOG.info('   INFO: N-Test cases Executed successfully');
                callback(null, 'N-Test cases Executed successfully');
            }).catch(error => {
                _self.LOG.error('   ERROR: ', error);
                callback(error);
            });
        } else {
            return SERVICE.TestExecutorService.executeNTest();
        }
    }

};