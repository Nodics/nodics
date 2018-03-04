/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    init: function() {

    },

    initTest: function() {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.initUTest().then(success => {
                _self.initNTest().then(success => {
                    resolve(true);
                }).catch(error => {
                    console.log('   ERROR: N-Test cases endup with error : ', error);
                    reject(false);
                });
            }).catch(error => {
                console.log('   ERROR: U-Test cases endup with error : ', error);
                _self.initNTest().then(succ => {
                    resolve(true);
                }).catch(err => {
                    console.log('   ERROR: N-Test cases endup with error : ', err);
                    reject(false);
                });
            });
        });
    },

    initUTest: function() {
        return new Promise((resolve, reject) => {
            let testConfig = CONFIG.get('test');
            if (testConfig.uTest.runOnStartup) {
                SERVICE.TestExecutorService.executeUTest().then(success => {
                    console.log('   INFO: U-Test cases Executed successfully:');
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                reject('Please enable unit test execution first');
            }
        });
    },

    initNTest: function() {
        return new Promise((resolve, reject) => {
            let testConfig = CONFIG.get('test');
            if (testConfig.nTest.runOnStartup) {
                SERVICE.TestExecutorService.executeNTest().then(success => {
                    console.log('   INFO: N-Test cases Executed successfully:');
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                reject('Please enable nodics test execution first');
            }
        });
    }
};