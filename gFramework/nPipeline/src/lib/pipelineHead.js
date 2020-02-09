/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = function (name, pipelineDefinition) {
    let _pipelineId = 'id';
    let _pipelineDefinition = pipelineDefinition;
    let _pipelineName = name;
    let _startNode = pipelineDefinition.startNode;
    let _hardStop = pipelineDefinition.hardStop || false;
    let _currentNode = {};
    let _handleError = {};
    let _nodeList = {};
    let _nextSuccessNode = {};
    let _successEndNode = {};
    let _resolve = null;
    let _reject = null;
    let _nodeLog = SERVICE.DefaultLoggerService.createLogger('PipelineNode');

    this.setPipelineId = function (id) {
        _pipelineId = id;
    };

    this.getPipelineId = function () {
        return _pipelineId;
    };

    this.getNodeName = function () {
        if (_currentNode) {
            return _currentNode.getName();
        }
        return null;
    };

    this.getPipelineName = function () {
        return _pipelineName;
    };

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

    this.start = function (id, request, response, resolve, reject) {
        _resolve = resolve;
        _reject = reject;
        _pipelineId = id;
        _currentNode = _nodeList[_startNode];
        if (!_currentNode) {
            this.LOG.error('Node link is broken for node : ' + _startNode + ' for pipeline : ' + _pipelineName);
            pipeline.exit(CONFIG.get('errorExitCode'));
        }
        if (!response.success) {
            response.success = [];
        }
        if (!response.errors) {
            response.errors = [];
        }
        this.next(request, response);
    };

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

    this.stop = function (request, response, success) {
        if (success !== undefined) {
            response.success = success;
        }
        _preNode = _currentNode;
        _currentNode = _successEndNode;
        this.next(request, response);
    };

    this.error = function (request, response, error) {
        if (error) {
            if (UTILS.isArray(error)) {
                error.forEach(element => {
                    response.errors.push(element);
                });
            } else {
                response.errors.push(error);
            }
        }
        _preNode = _currentNode;
        if (_currentNode.getError() && _nodeList[_currentNode.getError()]) {
            _currentNode = _nodeList[_currentNode.getError()];
        } else {
            _currentNode = _handleError;
        }
        this.next(request, response);
    };

    this.resolve = function (response) {
        _resolve(response);
    };

    this.reject = function (response) {
        _reject(response);
    };

    this.prepareNextNode = function (request, response) {
        if (_currentNode.getSuccess() && !UTILS.isObject(_currentNode.getSuccess())) {
            if (_nodeList[_currentNode.getSuccess()]) {
                _nextSuccessNode = _nodeList[_currentNode.getSuccess()];
            } else {
                this.LOG.error('Pipeline link is broken : invalid node line : ' + _currentNode.getSuccess());
                this.error(request, response, 'Pipeline link is broken : invalid node line : ' + _currentNode.getSuccess());
            }
        } else {
            _nextSuccessNode = null;
        }
    };

    this.next = function (request, response) {
        let _self = this;
        if (_currentNode) {
            this.prepareNextNode(request, response);
            if (_currentNode.getType() === 'function') {
                try {
                    let serviceName = _currentNode.getHandler().substring(0, _currentNode.getHandler().lastIndexOf('.'));
                    let operation = _currentNode.getHandler().substring(_currentNode.getHandler().lastIndexOf('.') + 1, _currentNode.getHandler().length);
                    try {
                        SERVICE[serviceName.toUpperCaseFirstChar()][operation](request, response, this);
                    } catch (err) {
                        _self.LOG.error('Error :: SERVICE.' + serviceName + '.' + operation + '(request, response, this)');
                        throw err;
                    }
                } catch (error) {
                    _self.LOG.error(_currentNode.getHandler());
                    _self.LOG.error(error);
                    _self.error(request, response, {
                        success: false,
                        code: 'ERR_PIPE_00000',
                        error: error.toString()
                    });
                }
            } else {
                try {
                    SERVICE.DefaultPipelineService.start(_currentNode.getHandler(), request, response).then(success => {
                        //response.success = success;
                        _self.nextSuccess(request, response, this);
                    }).catch(errors => {
                        // if (errors && UTILS.isArray(errors)) {
                        //     errors.forEach(element => {
                        //         response.errors.push(element);
                        //     });
                        // } else {
                        //     response.errors.push(errors);
                        // }
                        if (_hardStop) {
                            _self.error(request, response);
                        } else {
                            _self.nextSuccess(request, response, this);
                        }
                    });
                } catch (error) {
                    _self.LOG.error(error);
                    _self.error(request, response, {
                        success: false,
                        code: 'ERR_PIPE_00000',
                        error: error.toString()
                    });
                }
            }
        }
    };

};