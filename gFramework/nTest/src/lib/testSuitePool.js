/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTest/lib/testSuitePool
 * @description Lightweight in-memory pool of named Nodics test suites.
 * @layer lib
 * @owner nTest
 * @override Project modules may replace this class when suite pooling requires custom lookup behavior.
 */
module.exports = function() {
    let _testSuites = {};

    this.addSuite = function(suiteName, testSuite) {
        _testSuites[suiteName] = testSuite;
    };
    this.getSuite = function(suiteName) {
        return _testSuites[suiteName];
    };
    this.getAllSuite = function() {
        return _testSuites;
    };
};
