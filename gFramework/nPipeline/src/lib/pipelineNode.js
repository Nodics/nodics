/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module pipeline/lib/PipelineNode
 * @description Runtime wrapper for one pipeline node definition. A node stores
 * handler, type, success link, error link, and target routing metadata consumed
 * by `PipelineHead`.
 * @layer lib
 * @owner nPipeline
 * @override Project modules normally override pipeline definitions rather than
 * this class. If replaced, preserve getter methods consumed by `PipelineHead`.
 *
 * @property {string} pipelineNode.type `function` for service handlers or nested pipeline type.
 * @property {string} pipelineNode.handler Service operation or nested pipeline name.
 * @property {string|Object} pipelineNode.success Success transition definition.
 * @property {string} pipelineNode.error Optional error transition node.
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

    /**
     * Returns the node name.
     *
     * @returns {string} Node name.
     */
    this.getName = function () {
        return _name;
    };

    /**
     * Returns the node execution type.
     *
     * @returns {string} Node type.
     */
    this.getType = function () {
        return _type;
    };

    /**
     * Returns the node handler reference.
     *
     * @returns {string} Handler reference.
     */
    this.getHandler = function () {
        return _handler;
    };

    /**
     * Returns the success transition.
     *
     * @returns {string|Object} Success transition definition.
     */
    this.getSuccess = function () {
        return _success;
    };

    /**
     * Returns the error transition.
     *
     * @returns {string|undefined} Error transition node.
     */
    this.getError = function () {
        return _error;
    };

    /**
     * Returns target node metadata.
     *
     * @returns {Object|undefined} Target node metadata.
     */
    this.getTargetNodes = function () {
        return _targetNodes;
    };
};
