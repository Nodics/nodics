/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module pipeline/lib/PipelineHead
 * @description Runtime pipeline executor for Nodics. A pipeline head builds
 * node instances from the effective pipeline definition, tracks execution state,
 * moves through success/error links, executes nested pipelines, and enriches
 * errors with contextual metadata for database, search, event, and import flows.
 * @layer lib
 * @owner nPipeline
 * @override Project modules may override pipeline definitions and handlers;
 * replacing this class should preserve `start`, `nextSuccess`, `stop`, `error`,
 * `resolve`, and `reject` contracts used by all generated runtime pipelines.
 *
 * @property {string} pipelineDefinition.startNode First node name.
 * @property {Object} pipelineDefinition.nodes Pipeline node definitions.
 * @property {string} pipelineDefinition.handleError Optional error handler node.
 */
module.exports = function (name, pipelineDefinition) {
    let _pipelineId = 'id';
    let _pipelineDefinition = pipelineDefinition;
    let _pipelineName = name;
    let _startNode = pipelineDefinition.startNode;
    let _hardStop = pipelineDefinition.hardStop || false;
    let _currentNode = {};
    let _preNode = {};
    let _handleError = {};
    let _nodeList = {};
    let _nextSuccessNode = {};
    let _successEndNode = {};
    let _resolve = null;
    let _reject = null;
    let _nodeLog = SERVICE.DefaultLoggerService.createLogger('PipelineNode');

    /**
     * Sets the runtime pipeline execution id.
     *
     * @param {string} id Pipeline execution id.
     * @returns {undefined}
     */
    this.setPipelineId = function (id) {
        _pipelineId = id;
    };

    /**
     * Returns the runtime pipeline execution id.
     *
     * @returns {string} Pipeline execution id.
     */
    this.getPipelineId = function () {
        return _pipelineId;
    };

    /**
     * Returns the currently executing node name.
     *
     * @returns {string|null} Current node name.
     */
    this.getNodeName = function () {
        if (_currentNode) {
            return _currentNode.getName();
        }
        return null;
    };

    /**
     * Returns the pipeline definition name.
     *
     * @returns {string} Pipeline name.
     */
    this.getPipelineName = function () {
        return _pipelineName;
    };

    /**
     * Returns the current node handler reference.
     *
     * @returns {string|null} Handler reference in `Service.operation` or pipeline-name form.
     */
    this.getCurrentHandler = function () {
        if (_currentNode) {
            return _currentNode.getHandler();
        }
        return null;
    };

    /**
     * Builds contextual metadata for errors raised inside this pipeline.
     *
     * @param {Object} request Nodics pipeline request.
     * @returns {Object} Error context including pipeline, node, tenant, module, schema, event, or import details.
     */
    this.buildErrorContext = function (request) {
        let context = {
            layer: 'pipeline',
            pipelineName: this.getPipelineName(),
            pipelineId: this.getPipelineId(),
            nodeName: this.getNodeName(),
            handler: this.getCurrentHandler()
        };
        if (request) {
            context.tenant = request.tenant;
            context.moduleName = request.moduleName;
            if (request.schemaModel) {
                context.layer = 'database';
                context.schemaName = request.schemaModel.schemaName;
                context.modelName = request.schemaModel.modelName;
                context.collectionName = request.schemaModel.collectionName;
                context.moduleName = request.moduleName || request.schemaModel.moduleName;
            }
            if (request.searchModel) {
                context.layer = 'search';
                context.indexName = request.indexName || request.searchModel.indexName;
                context.moduleName = request.moduleName || request.searchModel.moduleName;
            }
            if (request.event) {
                context.layer = 'event';
                context.eventName = request.event.event;
                context.sourceName = request.event.sourceName;
                context.sourceId = request.event.sourceId;
                context.target = request.event.target;
                context.targetType = request.event.targetType;
            }
            if (request.importRun && request.importRun.runId) {
                context.importRunId = request.importRun.runId;
            }
            if (request.header && request.header.options) {
                context.owningModule = request.header.options.owningModule;
                context.targetModule = request.header.options.moduleName;
                context.schemaName = request.header.options.schemaName;
                context.indexName = request.header.options.indexName;
                context.operation = request.header.options.operation;
            }
            if (request.fileName) {
                context.fileName = request.fileName;
            }
        }
        return context;
    };

    /**
     * Builds executable pipeline nodes from the effective pipeline definition.
     *
     * @returns {undefined}
     * @sideEffects Initializes node list, success end node, and error handler node.
     */
    this.buildPipeline = function () {
        try {
            _.each(_pipelineDefinition.nodes, function (value, key) {
                _nodeList[key] = new CLASSES.PipelineNode(key, value);
                _nodeList[key].LOG = _nodeLog;
            });

            if (_pipelineDefinition.handleError) {
                if (_nodeList[_pipelineDefinition.handleError]) {
                    _handleError = _nodeList[_pipelineDefinition.handleError];
                } else {
                    _handleError = new CLASSES.PipelineNode('handleError', {
                        type: 'function',
                        pipeline: _pipelineDefinition.handleError
                    });
                    _handleError.LOG = _nodeLog;
                }
            } else {
                _handleError = _nodeList.handleError;
            }
            _successEndNode = _nodeList.successEnd;

        } catch (error) {
            this.LOG.error('While building pipeline: ', error);
        }
    };

    /**
     * Starts pipeline execution.
     *
     * @param {string} id Runtime pipeline execution id.
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Function} resolve Promise resolver supplied by `DefaultPipelineService.start`.
     * @param {Function} reject Promise rejecter supplied by `DefaultPipelineService.start`.
     * @returns {undefined}
     */
    this.start = function (id, request, response, resolve, reject) {
        _resolve = resolve;
        _reject = reject;
        _pipelineId = id;
        _currentNode = _nodeList[_startNode];
        if (!_currentNode) {
            this.LOG.error('Node link is broken for node : ' + _startNode + ' for pipeline : ' + _pipelineName);
            pipeline.exit(CONFIG.get('errorExitCode'));
        }
        // if (!response.success) {
        //     response.success = [];
        // }
        // if (!response.errors) {
        //     response.errors = [];
        // }
        this.next(request, response);
    };

    /**
     * Moves execution to the next success node.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response accumulator.
     * @returns {undefined}
     */
    this.nextSuccess = function (request, response) {
        _preNode = _currentNode;
        if (!_nextSuccessNode || _nextSuccessNode === null) {
            let targetNode = response.targetNode || 'default';
            this.LOG.debug('Processing pipeline target node : ' + targetNode);
            response.targetNode = 'none';
            if (targetNode && targetNode !== 'none' && UTILS.isObject(_currentNode.getSuccess())) {
                if (!_currentNode.getSuccess()[targetNode]) {
                    this.LOG.error('Invalid node configuration for: ' + targetNode);
                    this.error(request, response, 'Invalid node configuration for: ' + targetNode);
                } else {
                    _nextSuccessNode = _nodeList[_currentNode.getSuccess()[targetNode]];
                    _currentNode = _nextSuccessNode;
                    this.next(request, response);
                }
            }
        } else {
            _currentNode = _nextSuccessNode;
            this.next(request, response);
        }
    };

    /**
     * Stops normal processing and routes to the success end node.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response accumulator.
     * @param {*} [success] Optional success payload to assign to `response.success`.
     * @returns {undefined}
     */
    this.stop = function (request, response, success) {
        if (success !== undefined) {
            response.success = success;
        }
        _preNode = _currentNode;
        _currentNode = _successEndNode;
        this.next(request, response);
    };

    /**
     * Routes execution to the configured error handler after enriching the error.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response accumulator.
     * @param {*} error Error raised by the current node.
     * @returns {undefined}
     * @sideEffects Writes or appends `response.error`.
     */
    this.error = function (request, response, error) {
        try {
            if (error) {
                error = CLASSES.NodicsError.enrich(error, this.buildErrorContext(request));
                if (!response.error) {
                    response.error = error;
                } else {
                    response.error.add(error);
                }
            }
            _preNode = _currentNode;
            if (_currentNode.getError() && _nodeList[_currentNode.getError()]) {
                _currentNode = _nodeList[_currentNode.getError()];
            } else {
                _currentNode = _handleError;
            }
            this.next(request, response);
        } catch (err) {
            this.LOG.error('Pipeline: ' + this.getPipelineName() + ' is broken, Please validate');
            SERVICE.DefaultPipelineService.handleErrorEnd(request, response, this);
        }
    };

    /**
     * Resolves the outer pipeline promise.
     *
     * @param {*} response Final response payload.
     * @returns {undefined}
     */
    this.resolve = function (response) {
        _resolve(response);
    };

    /**
     * Rejects the outer pipeline promise.
     *
     * @param {*} response Final error payload.
     * @returns {undefined}
     */
    this.reject = function (response) {
        _reject(response);
    };

    /**
     * Prepares the next success node from the current node definition.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response accumulator.
     * @returns {undefined}
     */
    this.prepareNextNode = function (request, response) {
        if (_currentNode.getSuccess() && !UTILS.isObject(_currentNode.getSuccess())) {
            if (_nodeList[_currentNode.getSuccess()]) {
                _nextSuccessNode = _nodeList[_currentNode.getSuccess()];
            } else {
                //this.LOG.error('Pipeline link is broken : invalid node line : ' + _currentNode.getSuccess());
                this.error(request, response, 'Pipeline:' + this.getPipelineName() + ' link is broken : invalid node line : ' + _currentNode.getSuccess());
            }
        } else {
            _nextSuccessNode = null;
        }
    };

    /**
     * Executes the current node as either a service operation or nested pipeline.
     *
     * @param {Object} request Pipeline request.
     * @param {Object} response Pipeline response accumulator.
     * @returns {undefined}
     */
    this.next = function (request, response) {
        let _self = this;
        if (_currentNode) {
            this.prepareNextNode(request, response);
            if (_currentNode.getType() === 'function') {
                let serviceName = _currentNode.getHandler().substring(0, _currentNode.getHandler().lastIndexOf('.'));
                let operation = _currentNode.getHandler().substring(_currentNode.getHandler().lastIndexOf('.') + 1, _currentNode.getHandler().length);
                try {
                    SERVICE[serviceName.toUpperCaseFirstChar()][operation](request, response, this);
                } catch (err) {
                    _self.LOG.error('Error :: SERVICE.' + serviceName + '.' + operation + '(request, response, this)');
                    _self.LOG.error(err);
                    _self.error(request, response, new CLASSES.NodicsError(err, 'Error :: SERVICE.' + serviceName + '.' + operation + '(request, response, this)'));
                }
            } else {
                try {
                    SERVICE.DefaultPipelineService.start(_currentNode.getHandler(), request, response).then(result => {
                        response.success = _.merge(response.success || {}, result);
                        if (result && result.error) {
                            if (!response.error) {
                                response.error = result.error;
                            } else {
                                response.error.add(result.error);
                            }
                        }
                        _self.nextSuccess(request, response, this);
                    }).catch(error => {
                        if (!response.error) {
                            response.error = error;
                        } else {
                            response.error.add(error);
                        }
                        if (_hardStop) {
                            _self.error(request, response);
                        } else {
                            _self.nextSuccess(request, response, this);
                        }
                    });
                } catch (error) {
                    _self.error(request, response, new CLASSES.NodicsError(error));
                }
            }
        }
    };

};
