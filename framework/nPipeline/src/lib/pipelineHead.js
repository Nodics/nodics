/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = function (name, pipelineDefinition, callback) {
    let _pipelineId = 'id';
    let _pipelineDefinition = pipelineDefinition;
    let _self = this;
    let _pipelineName = name;
    let _startNode = pipelineDefinition.startNode;
    let _hardStop = pipelineDefinition.hardStop || false;
    let _currentNode = {};
    let _handleError = {};
    let _nodeList = {};
    let _preNode = {};
    let _nextSuccessNode = {};
    let _nextFailureNode = {};
    let _successEndNode = {};
    let _callback = callback;
    let _done = false;
    let _nodeLog = SYSTEM.createLogger('PipelineNode');

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
        let _self = this;
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

    };

    this.prepareNextNode = function () {
        if (_currentNode.getSuccess() && !UTILS.isObject(_currentNode.getSuccess())) {
            if (_nodeList[_currentNode.getSuccess()]) {
                _nextSuccessNode = _nodeList[_currentNode.getSuccess()];
            } else {
                this.LOG.error('Pipeline link is broken : invalid node line : ', _currentNode.getSuccess());
            }
        } else {
            _nextSuccessNode = null;
        }
        if (_currentNode.getFailure() && !UTILS.isObject(_currentNode.getSuccess())) {
            if (_nodeList[_currentNode.getFailure()]) {
                _nextFailureNode = _nodeList[_currentNode.getFailure()];
            } else {
                this.LOG.error('Pipeline link is broken : invalid node line : ', _currentNode.getFailure());
            }
        } else {
            _nextFailureNode = null;
        }
    };

    this.nextSuccess = function (pipelineRequest, pipelineResponse) {
        _preNode = _currentNode;
        if (!_nextSuccessNode || _nextSuccessNode === null) {
            let targetNode = pipelineResponse.targetNode
            this.LOG.debug('Processing pipeline target node : ', targetNode);
            pipelineResponse.targetNode = 'none';
            if (targetNode && targetNode !== 'none' && UTILS.isObject(_currentNode.getSuccess())) {
                if (!_currentNode.getSuccess()[targetNode]) {
                    this.LOG.error('Invalid node configuration for: ' + targetNode);
                    this.error(pipelineRequest, pipelineResponse, 'Invalid node configuration for: ' + targetNode);
                } else {
                    _nextSuccessNode = _nodeList[_currentNode.getSuccess()[targetNode]];
                    _currentNode = _nextSuccessNode;
                    this.next(pipelineRequest, pipelineResponse);
                }
            }
        } else {
            _currentNode = _nextSuccessNode;
            this.next(pipelineRequest, pipelineResponse);
        }

    };

    this.nextFailure = function (pipelineRequest, pipelineResponse) {
        _preNode = _currentNode;
        if (!_nextFailureNode || _nextFailureNode === null) {
            let targetNode = pipelineResponse.targetNode
            this.LOG.debug('Processing target node : ', targetNode);
            pipelineResponse.targetNode = 'none';
            if (targetNode && targetNode !== 'none' && UTILS.isObject(_currentNode.getFailure())) {
                if (!_currentNode.getFailure()[targetNode]) {
                    this.LOG.error('Invalid node configuration for: ' + targetNode);
                    this.error(pipelineRequest, pipelineResponse, 'Invalid node configuration for: ' + targetNode);
                } else {
                    _nextFailureNode = _nodeList[_currentNode.getFailure()[targetNode]];
                    _currentNode = _nextFailureNode;
                    this.next(pipelineRequest, pipelineResponse);
                }
            }
        } else {
            _currentNode = _nextFailureNode;
            this.next(pipelineRequest, pipelineResponse);
        }
        /*
        _preNode = _currentNode;
        _currentNode = _nextFailureNode;
        this.next(pipelineRequest, pipelineResponse);
        */
    };

    this.stop = function (pipelineRequest, pipelineResponse) {
        _preNode = _currentNode;
        _currentNode = _successEndNode;
        this.next(pipelineRequest, pipelineResponse);
    };

    this.error = function (pipelineRequest, pipelineResponse, err) {
        this.LOG.debug('Error occured while processing  pipeline node', _currentNode.getName(), ' - ', err);
        _preNode = _currentNode;
        _currentNode = _handleError;
        pipelineResponse.success = false;
        pipelineResponse.errors.PROC_ERR_0001 = {
            code: 'PROC_ERR_0001',
            message: 'PROC_ERR_0001',
            pipelineName: _pipelineName,
            nodeName: _preNode.getName(),
            error: err
        };
        let serviceName = _currentNode.getHandler().substring(0, _currentNode.getHandler().lastIndexOf('.'));
        let operation = _currentNode.getHandler().substring(_currentNode.getHandler().lastIndexOf('.') + 1, _currentNode.getHandler().length);
        SERVICE[serviceName][operation](pipelineRequest, pipelineResponse);
        if (_callback && !_done) {
            _callback();
        }
        _done = true;
    };

    this.start = function (id, pipelineRequest, pipelineResponse) {
        this.LOG.debug('Starting pipeline with pipeline id : ', id);
        _pipelineId = id;
        _currentNode = _nodeList[_startNode];
        if (!_currentNode) {
            this.LOG.error('Node link is broken for node : ', _startNode, ' for pipeline : ', _pipelineName);
            pipeline.exit(CONFIG.get('errorExitCode'));
        }
        this.next(pipelineRequest, pipelineResponse);
    };

    this.next = function (pipelineRequest, pipelineResponse) {
        let _self = this;
        if (_currentNode) {
            this.prepareNextNode();
            if (_currentNode.getType() === 'function') {
                try {
                    let serviceName = _currentNode.getHandler().substring(0, _currentNode.getHandler().lastIndexOf('.'));
                    let operation = _currentNode.getHandler().substring(_currentNode.getHandler().lastIndexOf('.') + 1, _currentNode.getHandler().length);
                    SERVICE[serviceName][operation](pipelineRequest, pipelineResponse, this);
                    if (!_nextSuccessNode) {
                        if (_callback && !_done) {
                            _callback();
                        }
                        _done = true;
                    }
                } catch (error) {
                    this.error(pipelineRequest, pipelineResponse, error);
                }
            } else {
                try {
                    SERVICE.PipelineService.startPipeline(_currentNode.getHandler(), pipelineRequest, pipelineResponse, () => {
                        if (_hardStop && !UTILS.isBlank(pipelineResponse.errors)) {
                            _self.nextFailure(pipelineRequest, pipelineResponse);
                        } else {
                            _self.nextSuccess(pipelineRequest, pipelineResponse, this);
                        }
                    });
                } catch (error) {
                    if (_hardStop) {
                        _self.error(pipelineRequest, pipelineResponse, error);
                    } else {
                        _self.nextSuccess(pipelineRequest, pipelineResponse, this);
                    }
                }
            }
        }
    };
};