/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function () {
    let _active = false;
    let _options = {};
    let _connOptions = {};
    let _connection = {};
    let _indexesList = [];

    this.setActive = function (active) {
        _active = active;
    };
    this.isActive = function () {
        return _active;
    };

    this.setOptions = function (options) {
        _options = options;
    };

    this.getOptions = function () {
        return _options;
    };

    this.setConnectionOptions = function (connOptions) {
        _connOptions = connOptions;
    };

    this.getConnectionOptions = function () {
        return _connOptions;
    };

    this.setConnection = function (connection) {
        _connection = connection;
    };

    this.getConnection = function () {
        return _connection;
    };

    this.addIndexName = function (indexName) {
        _indexesList.push(indexName);
    };

    this.removeIndexName = function (indexName) {
        if (_indexesList.indexOf(indexName) > -1) {
            _indexesList.splice(_indexesList.indexOf(indexName), 1);
        }
    };

    this.isActiveIndex = function (indexName) {
        return _indexesList.includes(indexName);
    };
};