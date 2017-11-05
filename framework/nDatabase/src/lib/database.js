/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function() {
    let _name = '';
    let _uri = '';
    let _options = {};
    let _connection = {};
    let _schema = {};

    this.setName = function(name) {
        _name = name;
    };
    this.getName = function(name) {
        return _name;
    }
    this.setURI = function(uri) {
        _uri = uri;
    };
    this.getRUI = function() {
        return _uri;
    };

    this.setOptions = function(options) {
        _options = options;
    };
    this.getOptions = function() {
        return _options;
    };

    this.setConnection = function(connection) {
        _connection = connection;
    };
    this.getConnection = function() {
        return _connection;
    };

    this.setSchema = function(schema) {
        _schema = schema;
    };
    this.getSchema = function() {
        return _schema;
    }
};