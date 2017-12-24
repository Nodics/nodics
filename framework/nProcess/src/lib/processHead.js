/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = function(name, processDefinition) {
    let _processId = 'id';
    let _processDefinition = processDefinition;
    let _self = this;
    let _processName = name;
    let _startNode = processDefinition.startNode;
    let _hardStop = processDefinition.hardStop || false;
    let _currentNode = {};
    let _handleError = {};
    let _nodeList = {};
    let _preNode = {};
    let _nextSuccessNode = {};
    let _nextFailureNode = {};

    this.setProcessId = function(id) {
        _processId = id;
    };

    this.getProcessId = function() {
        return _processId;
    };

    this.getNodeName = function() {
        if (_currentNode) {
            return _currentNode.getName();
        }
        return null;
    };
    this.getProcessName = function() {
        return _processName;
    };
    this.buildProcess = function() {
        let _self = this;
        _.each(_processDefinition.nodes, function(value, key) {
            _nodeList[key] = new CLASSES.ProcessNode(key, value);
        });

        if (_processDefinition.handleError) {
            if (_nodeList[_processDefinition.handleError]) {
                _handleError = _nodeList[_processDefinition.handleError];
            } else {
                _handleError = new CLASSES.ProcessNode('handleError', {
                    type: 'function',
                    process: _processDefinition.handleError
                });
            }
        } else {
            _handleError = _nodeList.handleError;
        }
    };

    this.prepareNextNode = function() {
        //console.log('        222222=========== ', _currentNode.getSuccess());
        if (_currentNode.getSuccess()) {
            if (_nodeList[_currentNode.getSuccess()]) {
                _nextSuccessNode = _nodeList[_currentNode.getSuccess()];
            } else {
                _nextSuccessNode = new CLASSES.ProcessNode('successEnd', {
                    type: 'function',
                    process: _currentNode.getSuccess()
                });
            }
        } else {
            _nextSuccessNode = _nodeList.successEnd;
        }
        if (_currentNode.getFailure()) {
            if (_nodeList[_currentNode.getFailure()]) {
                _nextFailureNode = _nodeList[_currentNode.getFailure()];
            } else {
                _nextFailureNode = new CLASSES.ProcessNode('failureEnd', {
                    type: 'function',
                    process: _currentNode.getFailure()
                });
            }
        } else {
            _nextFailureNode = _nodeList.failureEnd;
        }
    };

    this.nextSuccess = function(processRequest, processResponse) {
        _preNode = _currentNode;
        _currentNode = _nextSuccessNode;
        this.next(processRequest, processResponse);
    };

    this.nextFailure = function(processRequest, processResponse) {
        _preNode = _currentNode;
        _currentNode = _nextFailureNode;
        console.log(_currentNode.getName(), ' --------- : ', _currentNode.getFailure(), ' ------- ', _currentNode.getProcess());
        this.next(processRequest, processResponse);
    };

    this.error = function(processRequest, processResponse, err) {
        console.log('   ERROR: Error occured while processing node', err);
        _preNode = _currentNode;
        _currentNode = _handleError;
        processResponse.errors.PROC_ERR_0001 = {
            code: 'PROC_ERR_0001',
            message: 'PROC_ERR_0001',
            processName: _processName,
            nodeName: _preNode.getName(),
            error: err
        };
        eval(_currentNode.getProcess())(processRequest, processResponse);
    };

    this.start = function(id, processRequest, processResponse) {
        console.log('   INFO: Starting process with process id : ', id);
        _processId = id;
        _currentNode = _nodeList[_startNode];
        if (!_currentNode) {
            console.error('   ERROR: Node link is broken for node : ', _startNode, ' for process : ', _processName);
            process.exit(CONFIG.get('errorExitCode'));
        }
        this.next(processRequest, processResponse);
    };

    this.next = function(processRequest, processResponse) {
        if (_currentNode) {
            this.prepareNextNode();
            if (_currentNode.getType() === 'function') {
                try {
                    console.log(' =========== ', _currentNode.getProcess());
                    eval(_currentNode.getProcess())(processRequest, processResponse, this);
                } catch (error) {
                    console.log(' ===========  GOT Error', _currentNode.getProcess());
                    this.error(processRequest, processResponse, error);
                }
            } else {
                try {
                    let _self = this;
                    SERVICE.ProcessService.startProcess(_currentNode.getProcess(), processRequest, processResponse);
                    if (_hardStop && !UTILS.isBlank(processResponse.errors)) {
                        _self.nextFailure(processRequest, processResponse);
                    } else {
                        _self.nextSuccess(processRequest, processResponse, this);
                    }
                } catch (error) {
                    if (_hardStop) {
                        _self.error(processRequest, processResponse, error);
                    } else {
                        _self.nextSuccess(processRequest, processResponse, this);
                    }
                }
            }
        }
    };
};