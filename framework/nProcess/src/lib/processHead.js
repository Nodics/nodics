const _ = require('lodash');

module.exports = function(name, processDefinition, defaultNodes) {

    let _processDefinition = processDefinition;
    let _defaultNodes = defaultNodes;
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

    this.init = function() {
        let _self = this;
        _.each(_processDefinition.nodes, function(value, key) {
            _nodeList[key] = new CLASSES.ProcessNode(key, value);
        });
        _.each(_defaultNodes.nodes, function(value, key) {
            _nodeList[key] = new CLASSES.ProcessNode(key, value);
        });

        _currentNode = _nodeList[_startNode];

        if (!_currentNode) {
            console.log('1Node link is broken for node : ', _startNode, ' for process : ', _processName);
            process.exit(CONFIG.errorExitCode);
        }
        if (_processDefinition.handleError) {
            if (_nodeList[_processDefinition.handleError]) {
                _handleError = _nodeList[_processDefinition.handleError];
            } else {
                _handleError = {
                    name: 'handleError',
                    type: 'function',
                    process: _processDefinition.handleError
                }
            }
        } else {
            _handleError = _nodeList['handleError'];
        }
    };
    this.prepareNextNode = function() {
        if (_currentNode.getSuccess()) {
            if (_nodeList[_currentNode.getSuccess()]) {
                _nextSuccessNode = _nodeList[_currentNode.getSuccess()];
            } else {
                _nextSuccessNode = {
                    name: 'successEnd',
                    type: _currentNode.getType(),
                    process: _currentNode.getSuccess()
                }
            }

        }
        if (_currentNode.getFailure()) {
            if (_nodeList[_currentNode.getFailure()]) {
                _nextFailureNode = _nodeList[_currentNode.getFailure()];
            } else {
                _nextFailureNode = {
                    name: 'failureEnd',
                    type: _currentNode.getType(),
                    process: _currentNode.getFailure()
                }
            }

        }
    };

    this.nextSuccess = function(processRequest, processResponse) {
        _preNode = _currentNode;
        _currentNode = _nextSuccessNode;
        this.start(processRequest, processResponse);
    };

    this.nextFailure = function(processRequest, processResponse) {
        _preNode = _currentNode;
        _currentNode = _nextFailureNode;
        this.start(processRequest, processResponse);
    };

    this.error = function(processRequest, processResponse, error) {
        _preNode = _currentNode;
        _currentNode = _handleError;
        processResponse.errors.PROC_ERR_0001 = {
            code: 'PROC_ERR_0001',
            message: 'PROC_ERR_0001',
            processName: _processName,
            nodeName: _currentNode.getName(),
            error: error
        };
        eval(_currentNode.process)(processRequest, processResponse);
    };
    this.start = function(processRequest, processResponse) {
        if (_currentNode) {
            this.prepareNextNode();
            if (_currentNode.getType() === 'function') {
                try {
                    eval(_currentNode.getProcess())(processRequest, processResponse, this);
                } catch (error) {
                    /*console.log(err);
                    processResponse.errors.PROC_ERR_0001 = {
                        code: 'PROC_ERR_0001',
                        message: 'PROC_ERR_0001',
                        processName: _processName,
                        nodeName: _currentNode.getName(),
                        error: err
                    };*/
                    this.error(processRequest, processResponse, error);
                    throw new Error('something bad happened');
                }
            } else {
                try {
                    PROCESS[_currentNode.getProcess()].start(processRequest, processResponse); //need to be called by ProcessService
                    this.nextSuccess(processRequest, processResponse);
                } catch (error) {
                    /*if (!PROCESS[_currentNode.getProcess()]) {
                        processResponse.errors.PROC_ERR_0001 = {
                            code: 'PROC_ERR_0001',
                            message: 'PROC_ERR_0001',
                            processName: _currentNode.getProcess(),
                            error: error
                        };
                    }*/
                    if (_hardStop) {
                        this.error(processRequest, processResponse, error);
                    } else {
                        this.nextSuccess(processRequest, processResponse);
                    }
                }
            }
        }
    }
}