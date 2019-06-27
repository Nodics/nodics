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
    let _indexesList = {};

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

    this.setIndexes = function (indexesList) {
        _indexesList = indexesList;
    };

    this.addIndex = function (indexName, metaData) {
        _indexesList[indexName] = metaData;
    };

    this.getIndex = function (indexName) {
        return _indexesList[indexName];
    };

    this.removeIndex = function (indexName) {
        if (_indexesList[indexName]) {
            delete _indexesList[indexName];
        }
        return true;
    };

    this.isActiveIndex = function (indexName) {
        return _indexesList[indexName] ? true : false;
    };
};