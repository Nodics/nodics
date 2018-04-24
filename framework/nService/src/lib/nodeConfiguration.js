/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function(nodeName, httpHost, httpsHost, httpPort, httpsPort) {
    let _nodeName = nodeName;
    let _httpHost = httpHost;
    let _httpsHost = httpsHost;
    let _httpPort = httpPort;
    let _httpsPort = httpsPort;

    this.LOG = SYSTEM.createLogger('ExternalNode');

    this.getNodeName = function() {
        return _nodeName;
    };

    this.getHttpHost = function() {
        return _httpHost;
    };

    this.getHttpsHost = function() {
        return _httpsHost;
    };

    this.getHttpPort = function() {
        return _httpPort;
    };

    this.getHttpsPort = function() {
        return _httpsPort;
    };
};