/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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