/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module service/lib/NodeConfiguration
 * @description Runtime endpoint descriptor for one server or node. Module
 * topology objects use this class to expose HTTP/HTTPS host and port data for
 * internal service calls.
 * @layer lib
 * @owner nService
 * @override Project modules may replace this class to add protocol, health, or
 * service-discovery metadata while preserving endpoint getter methods.
 *
 * @property {string} nodeId Node, server, or abstract server identifier.
 * @property {string} httpHost HTTP host.
 * @property {string} httpsHost HTTPS host.
 * @property {number|string} httpPort HTTP port.
 * @property {number|string} httpsPort HTTPS port.
 */
module.exports = function (nodeId, httpHost, httpsHost, httpPort, httpsPort) {
    let _nodeId = nodeId;
    let _httpHost = httpHost;
    let _httpsHost = httpsHost;
    let _httpPort = httpPort;
    let _httpsPort = httpsPort;

    this.LOG = SERVICE.DefaultLoggerService.createLogger('ExternalNode');

    this.getNodeId = function () {
        return _nodeId;
    };

    this.getHttpHost = function () {
        return _httpHost;
    };

    this.getHttpsHost = function () {
        return _httpsHost;
    };

    this.getHttpPort = function () {
        return _httpPort;
    };

    this.getHttpsPort = function () {
        return _httpsPort;
    };
};
