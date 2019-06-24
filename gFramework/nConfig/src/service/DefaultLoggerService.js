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
const wElasticsearch = require('winston-elasticsearch');
var elasticsearch = require('elasticsearch');
const utils = require('../utils/utils');

module.exports = {

    elasticClient: null,
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

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
        let logger = new winston.createLogger(config);
        NODICS.addLogger(entityName, logger);
        return logger;
    },

    getLoggerConfiguration: function (entityName, level, logConfig) {
        return {
            level: level || logConfig.level || 'info',
            transports: this.createTransports(entityName, logConfig)
        };
    },

    getLogFormat: function (logConfig) {
        if (logConfig.format == 'json') {
            return winston.format.json();
        } else {
            return winston.format.simple();
        }
    },

    createTransports: function (labelName, logConfig) {
        let transports = [];
        Object.keys(logConfig.transports).forEach(channel => {
            let channelConfig = logConfig.transports[channel];
            Object.keys(channelConfig).forEach(transportName => {
                let transportConfig = channelConfig[transportName];
                if (transportConfig.enabled) {
                    let transport = null;
                    if (channel === 'console') {
                        transport = this.createConsoleTransport(labelName, transportConfig);
                    } else if (channel === 'file') {
                        transport = this.createFileTransport(labelName, transportConfig);
                    } else if (channel === 'elastic') {
                        transport = this.createElasticTransport(labelName, transportConfig);
                    }
                    if (transport) {
                        transports.push(transport);
                    }
                }
            });
        });
        return transports;
    },

    createConsoleTransport: function (labelName, config) {
        let _self = this;
        let options = {};
        options.label = labelName;
        options.format = winston.format.combine(
            winston.format.label({ label: labelName }),
            winston.format.colorize(),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.splat(),
            winston.format.prettyPrint(),
            _self.getLogFormat(config),
            winston.format.printf(({ level, message, label, timestamp }) => {
                return `${timestamp}  ${level}: [${label}] ${message}`;
            })
        );
        return new winston.transports.Console(options);
    },

    createFileTransport: function (labelName, config) {
        let _self = this;
        let options = _.merge({}, config.options);
        options.label = labelName;
        options.format = winston.format.combine(
            winston.format.label({ label: labelName }),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.splat(),
            winston.format.prettyPrint(),
            _self.getLogFormat(config),
            winston.format.printf(({ level, message, label, timestamp }) => {
                return `${timestamp} ${level}: [${label}]  ${message}`;
            })
        );
        options.filename = NODICS.getServerPath() + '/temp/logs/' + options.filename;
        return new winston.transports.File(options);
    },

    createElasticTransport: function (labelName, config) {
        let options = _.merge({}, config.options);
        options.label = labelName;
        options.client = this.createElasticLoggerClient(options.client);
        return new wElasticsearch(options);
    },

    createElasticLoggerClient: function (options) {
        if (this.elasticClient === null) {
            this.elasticClient = new elasticsearch.Client(options);
        }
        return this.elasticClient;
    },
};