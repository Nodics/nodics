/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function(name, processNode) {

    let _name = name;
    let _type = processNode.type || 'function';
    let _process = processNode.process;
    let _success = processNode.success || 'SERVICE.ProcessHandlerService.handleSucessEnd';
    let _failure = processNode.failure || 'PROCESS.ProcessHandlerService.handleFailureEnd';

    if (!_process) {
        throw new Error("Process property for node : " + _name + " can't be null or blank");
    }

    this.getName = function() {
        return _name;
    };

    this.getType = function() {
        return _type;
    };

    this.getProcess = function() {
        return _process;
    };

    this.getSuccess = function() {
        return _success;
    };

    this.getFailure = function() {
        return _failure;
    };
}