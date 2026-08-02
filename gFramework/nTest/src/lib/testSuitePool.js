/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
