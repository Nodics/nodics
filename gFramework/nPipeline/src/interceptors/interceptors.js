/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
