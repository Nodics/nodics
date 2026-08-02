/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/lib/Database
 * @description Lightweight runtime database wrapper used by Nodics connection
 * handlers. It stores module name, URI, adapter options, client, connection,
 * collection metadata, and schema metadata without binding the framework to a
 * specific database driver.
 * @layer lib
 * @owner nDatabase
 * @override Project modules may provide an alternate database wrapper class when
 * a database adapter needs additional state, while preserving getter/setter
 * methods consumed by generated model handlers.
 */
module.exports = function () {
    let _name = '';
    let _uri = '';
    let _options = {};
    let _connectionOptions = {};
    let _client = {};
    let _connection = {};
    let _collections = [];
    let _colectionList = [];
    let _schema = {};
    let _capabilities = {};

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

    this.setClient = function (client) {
        _client = client;
    };

    this.getClient = function () {
        return _client;
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

    /**
     * Stores capabilities discovered from the live database connection.
     *
     * @param {Object} capabilities Provider-neutral capability snapshot.
     * @returns {void}
     */
    this.setCapabilities = function (capabilities) {
        _capabilities = capabilities || {};
    };

    /**
     * Returns capabilities discovered from the live database connection.
     *
     * @returns {Object} Provider-neutral capability snapshot.
     */
    this.getCapabilities = function () {
        return _capabilities;
    };
};
