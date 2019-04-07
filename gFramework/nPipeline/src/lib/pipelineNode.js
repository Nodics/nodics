/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function (name, pipelineNode) {

    let _name = name;
    let _type = pipelineNode.type || 'function';
    let _handler = pipelineNode.handler;
    let _success = pipelineNode.success;
    let _error = pipelineNode.error;
    let _targetNodes = pipelineNode.target;

    if (!_handler) {
        throw new Error("Handler property for node : " + _name + " can't be null or blank");
    }

    this.getName = function () {
        return _name;
    };

    this.getType = function () {
        return _type;
    };

    this.getHandler = function () {
        return _handler;
    };

    this.getSuccess = function () {
        return _success;
    };

    this.getError = function () {
        return _error;
    };

    this.getTargetNodes = function () {
        return _targetNodes;
    };
};