/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const winston = require('winston');
const wElasticsearch = require('winston-elasticsearch');
var elasticsearch = require('elasticsearch');
const splt = require('triple-beam').SPLAT;
const utils = require('../utils/utils');
const logform = require('logform');

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
            format: logform.format.combine(
                logform.format.errors({ stack: true }),
                logform.format.metadata(),
                logform.format.json()
            ),
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

    formatObject: function (param) {
        if (_.isObject(param)) {
            return JSON.stringify(param);
        }
        return param;
    },

    createConsoleTransport: function (labelName, config) {
        let _self = this;
        let options = {};
        options.label = labelName;
        options.format = logform.format.combine(
            winston.format.label({ label: labelName }),
            winston.format.colorize(),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.prettyPrint(),
            winston.format.printf((info) => {
                const splat = info[splt] || [];
                let message = this.formatObject(info.message || info.errmsg);
                const rest = splat.map(this.formatObject).join(' ');
                if (rest && !utils.isBlank(rest) && rest !== '{}' && rest !== '[]') {
                    message = message + ' ' + rest;
                } else if (info.metadata && !utils.isBlank(info.metadata) && info.metadata !== '{}' && info.metadata !== '[]') {
                    message = message + ' ' + this.formatObject(info.metadata);
                }
                return `${info.timestamp}  ${info.level}: [${info.label}] ${message}`;
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
            winston.format.prettyPrint(),
            _self.getLogFormat(config),
            winston.format.printf((info) => {
                const splat = info[splt] || [];
                const message = this.formatObject(info.message || info.errmsg);
                const rest = splat.map(this.formatObject).join(' ');
                if (rest && !utils.isBlank(rest) && rest !== '{}' && rest !== '[]') {
                    info.message = `${message} ${rest}`;
                } else {
                    info.message = `${message}`;
                }
                return `${info.timestamp}  ${info.level}: [${info.label}] ${info.message}`;
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