/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module pipeline/pipelines/Pipelines
 * @description Base pipeline definitions shared by all Nodics runtime pipelines.
 * `defaultPipeline` contributes standard success and error terminal nodes that
 * are merged into concrete pipeline definitions at execution time.
 * @layer pipeline
 * @owner nPipeline
 * @override Project modules may layer additional pipeline definitions or
 * override default terminal handlers, but should preserve `successEnd` and
 * `handleError` semantics expected by `PipelineHead`.
 *
 * @property {Object} defaultPipeline Standard terminal node definitions.
 */
module.exports = {
    defaultPipeline: {
        nodes: {
            successEnd: {
                name: 'successEnd',
                type: 'function',
                handler: 'DefaultPipelineService.handleSucessEnd'
            },
            handleError: {
                name: 'handleError',
                type: 'function',
                handler: 'DefaultPipelineService.handleErrorEnd'
            }
        }
    }
};
