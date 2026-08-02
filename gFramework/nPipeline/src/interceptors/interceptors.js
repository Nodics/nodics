/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module pipeline/interceptors/PipelineInterceptors
 * @description Pipeline interceptor registry extension slot. The base pipeline
 * module currently ships no active interceptors, but this file preserves the
 * layered configuration location for pipeline persistence or governance hooks.
 * @layer interceptor
 * @owner nPipeline
 * @override Project modules may add pipeline schema interceptors here without
 * changing the core pipeline executor.
 */
module.exports = {

    // preSavePipeline: {
    //     type: 'schema',
    //     item: 'pipeline',
    //     trigger: 'preSave',
    //     active: 'true',
    //     index: 0,
    //     handler: 'DefaultPipelineSaveInterceptorService.mergeExisting'
    // }
};
