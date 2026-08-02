/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
