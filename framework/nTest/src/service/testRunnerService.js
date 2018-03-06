/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    runUTest: function(input, callback) {
        if (callback) {
            SERVICE.TestExecutorService.executeUTest().then(success => {
                console.log('   INFO: U-Test cases Executed successfully');
                callback(null, 'U-Test cases Executed successfully');
            }).catch(error => {
                console.log('   ERROR: ', error);
                callback(error);
            });
        } else {
            return SERVICE.TestExecutorService.executeUTest();
        }
    },

    runNTest: function(input, callback) {
        if (callback) {
            SERVICE.TestExecutorService.executeNTest().then(success => {
                console.log('   INFO: N-Test cases Executed successfully');
                callback(null, 'N-Test cases Executed successfully');
            }).catch(error => {
                console.log('   ERROR: ', error);
                callback(error);
            });
        } else {
            return SERVICE.TestExecutorService.executeNTest();
        }
    }

};