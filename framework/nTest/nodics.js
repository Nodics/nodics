/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    init: function () {

    },

    initTest: function () {
        let _self = this;
        SYSTEM.LOG.info('---------------------------------------------------------------------------');
        SYSTEM.LOG.info('=> Starting test case execution process   ###');
        SYSTEM.LOG.info('---------------------------------------------------------------------------');
        return new Promise((resolve, reject) => {
            _self.initUTest().then(success => {
                _self.initNTest().then(success => {
                    resolve(true);
                }).catch(error => {
                    SYSTEM.LOG.error('N-Test cases endup with error : ', error);
                    reject(false);
                });
            }).catch(error => {
                SYSTEM.LOG.error('U-Test cases endup with error : ', error);
                _self.initNTest().then(succ => {
                    resolve(true);
                }).catch(err => {
                    SYSTEM.LOG.error('N-Test cases endup with error : ', err);
                    reject(false);
                });
            });
        });
    },

    initUTest: function () {
        return new Promise((resolve, reject) => {
            let testConfig = CONFIG.get('test');
            if (testConfig.uTest.runOnStartup) {
                SERVICE.TestExecutionService.executeUTest().then(success => {
                    SYSTEM.LOG.info('U-Test cases Executed successfully:');
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                reject('Please enable unit test execution first');
            }
        });
    },

    initNTest: function () {
        return new Promise((resolve, reject) => {
            let testConfig = CONFIG.get('test');
            if (testConfig.nTest.runOnStartup) {
                SERVICE.TestExecutionService.executeNTest().then(success => {
                    SYSTEM.LOG.info('N-Test cases Executed successfully:');
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