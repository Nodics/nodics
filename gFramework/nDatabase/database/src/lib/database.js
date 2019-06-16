/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function () {
    let _name = '';
    let _uri = '';
    let _options = {};
    let _connectionOptions = {};
    let _connection = {};
    let _collections = [];
    let _colectionList = [];
    let _schema = {};

    this.setCollections = function (collections) {
        _collections = collections;
        collections.forEach(element => {
            _colectionList.push(element.name);
        });
    };

    this.getCollections = function () {
        return _collections;
    };

    this.getCollectionList = function () {
        return _colectionList;
    };

    this.setName = function (name) {
        _name = name;
    };

    this.getName = function (name) {
        return _name;
    };

    this.setURI = function (uri) {
        _uri = uri;
    };

    this.getRUI = function () {
        return _uri;
    };

    this.setOptions = function (options) {
        _options = options;
    };

    this.getOptions = function () {
        return _options;
    };

    this.setConnectionOptions = function (options) {
        _connectionOptions = options;
    };

    this.getConnectionOptions = function () {
        return _connectionOptions;
    };

    this.setConnection = function (connection) {
        _connection = connection;
    };

    this.getConnection = function () {
        return _connection;
    };

    this.setSchema = function (schema) {
        _schema = schema;
    };

    this.getSchema = function () {
        return _schema;
    };
};