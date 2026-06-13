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
var elasticsearch = require('@elastic/elasticsearch');
const splt = require('triple-beam').SPLAT;
const utils = require('../utils/utils');
const logform = require('logform');
const flatted = require('flatted');

/**
 * @module config/service/DefaultLoggerService
 * @description Central logger factory for Nodics runtime entities. It creates and
 * registers Winston loggers using layered configuration and supports console, file,
 * and Elasticsearch transports.
 * @layer service
 * @owner nConfig
 * @override Project modules may override logger configuration through properties or
 * replace this service to integrate an enterprise observability platform.
 *
 * @property {Object} NODICS Logger registry owner.
 * @property {Object} CONFIG Layered configuration registry for log settings.
 * @property {Object|null} elasticClient Cached Elasticsearch logger client.
 */
module.exports = {

    /**
     * Cached Elasticsearch client used by elastic logger transport.
     *
     * @type {Object|null}
     */
    elasticClient: null,

    /**
     * Initializes the logger service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the logger service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Changes the level of a registered logger at runtime.
     *
     * @param {Object} input Log level change request.
     * @param {string} input.entityName Registered logger/entity name.
     * @param {string} input.logLevel New log level.
     * @returns {boolean} True when logger exists and level is changed.
     */
    changeLogLevel: function (input) {
        let logger = NODICS.getLogger(input.entityName);
        if (logger) {
            logger.level = input.logLevel;
            return true;
        }
        return false;
    },

    /**
     * Creates and registers a Winston logger for a Nodics runtime entity.
     *
     * @param {string} entityName Service, facade, controller, module, or framework entity name.
     * @param {Object} [logConfig] Optional log configuration; defaults to `CONFIG.log`.
     * @returns {Object} Winston logger instance.
     * @sideEffects Adds logger to `NODICS` logger registry.
     */
    createLogger: function (entityName, logConfig) {
        logConfig = logConfig || CONFIG.get('log');
        let entityLevel = logConfig['logLevel' + entityName];
        let config = this.getLoggerConfiguration(entityName, entityLevel, logConfig);
        let logger = new winston.createLogger(config);
        NODICS.addLogger(entityName, logger);
        return logger;
    },

    /**
     * Builds Winston logger configuration for an entity.
     *
     * @param {string} entityName Entity/logger label.
     * @param {string} level Explicit entity log level.
     * @param {Object} logConfig Layered log configuration.
     * @returns {Object} Winston logger configuration.
     */
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

    /**
     * Returns configured log format.
     *
     * @param {Object} logConfig Transport log configuration.
     * @returns {Object} Winston format.
     */
    getLogFormat: function (logConfig) {
        if (logConfig.format == 'json') {
            return winston.format.json();
        } else {
            return winston.format.simple();
        }
    },

    /**
     * Creates all enabled logger transports from layered configuration.
     *
     * @param {string} labelName Logger label.
     * @param {Object} logConfig Layered log transport configuration.
     * @returns {Object[]} Winston transport instances.
     */
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

    /**
     * Serializes objects safely for log output.
     *
     * @param {*} param Value to format.
     * @returns {*} Serialized object string or original scalar value.
     */
    formatObject: function (param) {
        if (_.isObject(param)) {
            return flatted.stringify(param);
            //return JSON.stringify(param);
        }
        return param;
    },

    /**
     * Creates a colorized console transport.
     *
     * @param {string} labelName Logger label.
     * @param {Object} config Console transport configuration.
     * @returns {Object} Winston console transport.
     */
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

    /**
     * Creates a file transport rooted under the selected server log directory.
     *
     * @param {string} labelName Logger label.
     * @param {Object} config File transport configuration.
     * @returns {Object} Winston file transport.
     */
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

    /**
     * Creates an Elasticsearch transport.
     *
     * @param {string} labelName Logger label.
     * @param {Object} config Elasticsearch transport configuration.
     * @returns {Object} Winston Elasticsearch transport.
     */
    createElasticTransport: function (labelName, config) {
        let options = _.merge({}, config.options);
        options.label = labelName;
        options.client = this.createElasticLoggerClient(options.client);
        return new wElasticsearch(options);
    },

    /**
     * Creates or reuses the Elasticsearch logger client.
     *
     * @param {Object} options Elasticsearch client options.
     * @returns {Object} Elasticsearch client.
     * @sideEffects Caches client in `elasticClient`.
     */
    createElasticLoggerClient: function (options) {
        if (this.elasticClient === null) {
            this.elasticClient = new elasticsearch.Client(options);
        }
        return this.elasticClient;
    },
};
