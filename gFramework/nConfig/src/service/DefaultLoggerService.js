/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const winston = require('winston');
require('winston-daily-rotate-file');
const Elasticsearch = require('winston-elasticsearch');
const utils = require('../utils/utils');

module.exports = {

    changeLogLevel: function (input) {
        let logger = NODICS.getLogger(input.entityName);
        if (logger) {
            logger.level = input.logLevel;
            return true;
        }
        return false;
    },

    createLogger: function (entityName, logConfig) {
        logConfig = logConfig || CONFIG.get('log');
        let entityLevel = logConfig['logLevel' + entityName];
        let config = this.getLoggerConfiguration(entityName, entityLevel, logConfig);
        let logger = new winston.Logger(config);
        NODICS.addLogger(entityName, logger);
        return logger;
    },

    getLoggerConfiguration: function (entityName, level, logConfig) {
        return {
            level: level || logConfig.level || 'info',
            transports: this.getLogTransports(entityName, logConfig)
        };
    },

    getLogFormat: function (logConfig) {
        if (logConfig.format == 'json') {
            return winston.format.json();
        } else {
            return winston.format.simple();
        }
    },
    getLogTransports: function (entityName, logConfig) {
        let transports = [];
        transports.push(this.createConsoleTransport(entityName, logConfig));
        if (logConfig.output.file) {
            transports.push(this.createFileTransport(entityName, logConfig));
        }
        if (logConfig.output.elastic) {
            transports.push(this.createFileTransport(entityName, logConfig));
        }
        return transports;
    },

    createConsoleTransport: function (entityName, logConfig) {
        let consoleConfig = _.merge({}, logConfig.consoleConfig);
        consoleConfig.label = entityName;
        return new winston.transports.Console(consoleConfig);
    },

    createFileTransport: function (entityName, logConfig) {
        let transport = {};
        let fileConfig = _.merge({}, logConfig.fileConfig);
        fileConfig.label = entityName;
        if (fileConfig.dirname.startsWith('.')) {
            fileConfig.dirname = NODICS.getServerPath() + '/temp/logs';
        }
        try {
            transport = new winston.transports.DailyRotateFile(fileConfig);
        } catch (error) {
            console.error(error);
        }
        return transport;
    },
    createElasticTransport: function (entityName, logConfig) {
        let elasticConfig = _.merge({}, logConfig.elasticConfig);
        elasticConfig.label = entityName;
        return new Elasticsearch(elasticConfig);
    }
};