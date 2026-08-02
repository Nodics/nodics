/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module common/pipelines/InterceptorPipelines
 * @description Pipeline definition for runtime interceptor updates. It validates update
 * payloads, loads changed interceptor definitions, merges them into effective runtime
 * state, and publishes cleanup events.
 * @layer pipeline
 * @owner nCommon
 * @override Project modules may override or extend this pipeline to add audit,
 * validation, approval, rollback, or cache cleanup behavior for dynamic interceptors.
 *
 * @property {Object} interceptorUpdatedPipeline Runtime interceptor update pipeline.
 * @property {string} interceptorUpdatedPipeline.startNode First node for update processing.
 * @property {Object} interceptorUpdatedPipeline.nodes Pipeline node graph.
 * @property {string} node.handler Service method invoked by the pipeline node.
 */
module.exports = {

    interceptorUpdatedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.validateRequest',
                success: 'loadInterceptor'
            },
            loadInterceptor: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.loadInterceptor',
                success: 'mergeExisting'
            },
            mergeExisting: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.mergeExisting',
                success: 'publishCleanup'
            },
            publishCleanup: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.publishCleanup',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultInterceptorUpdatedPipelineService.handleErrorEnd'
            }
        }
    }
};
