/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function() {
    let _childSuites = {};
    let _testSuite = {};
    let _index = 0;

    this.setIndex = function(index) {
        _index = index;
    };
    this.getIndex = function() {
        return _index;
    };

    this.addSuite = function(testSuite) {
        _testSuite = testSuite;
    };
    this.getSuite = function() {
        return _testSuite;
    };

    this.addChildSuite = function(suiteName, testSuite) {
        _childSuites[suiteName] = testSuite;
    };
    this.getChildSuite = function(suiteName) {
        return _childSuites[suiteName];
    };
    this.getAllChildSuite = function() {
        return _childSuites;
    };
};