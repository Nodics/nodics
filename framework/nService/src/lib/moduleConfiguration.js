/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = function(moduleName) {

    let _moduleName = moduleName;
    let _options = {};
    let _server = {};
    let _abstractServer = {};
    let _nodes = {};
    this.LOG = SYSTEM.createLogger('ExternalModule');

    this.getModuleName = function() {
        return _moduleName;
    };

    this.addOptions = function(options) {
        _options = options;
    };
    this.getOptions = function() {
        return _options;
    };

    this.addServer = function(serverConfig) {
        _server = new CLASSES.NodeConfiguration('server',
            serverConfig.httpHost,
            serverConfig.httpsHost,
            serverConfig.httpPort,
            serverConfig.httpsPort);
    };
    this.getServer = function() {
        return _server;
    };

    this.addAbstractServer = function(abstractConfig) {
        _abstractServer = new CLASSES.NodeConfiguration('abstractServer',
            abstractConfig.httpHost,
            abstractConfig.httpsHost,
            abstractConfig.httpPort,
            abstractConfig.httpsPort);
    };
    this.getAbstractServer = function() {
        return _abstractServer;
    };

    this.addNode = function(nodeId, nodeConfig) {
        if (UTILS.isBlank(_nodes)) {
            _nodes[nodeId] = new CLASSES.NodeConfiguration(nodeId,
                nodeConfig.httpHost,
                nodeConfig.httpsHost,
                nodeConfig.httpPort,
                nodeConfig.httpsPort);
        } else {
            _.each(_nodes, (node, id) => {
                if (node.getHttpHost() === nodeConfig.httpHost ||
                    node.getHttpPort() === nodeConfig.httpPort ||
                    node.getHttpsHost() === nodeConfig.httpsHost ||
                    node.getHttpsPort() === nodeConfig.httpsPort) {
                    throw new Error('Invalid node configuration for ', nodeId, ' in module : ', _moduleName);
                }
            });
            _nodes[nodeId] = new CLASSES.NodeConfiguration(nodeId,
                nodeConfig.httpHost,
                nodeConfig.httpsHost,
                nodeConfig.httpPort,
                nodeConfig.httpsPort);
        }
    };
    this.getNodes = function() {
        return _nodes;
    };
    this.getNode = function(nodeId) {
        if (_nodes[nodeId]) {
            return _nodes[nodeId];
        } else {
            throw new Error('Invalid node id : ', nodeId, ' , please validate');
        }
    };
};