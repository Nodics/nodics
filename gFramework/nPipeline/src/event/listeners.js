/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nPipeline/event/listeners
 * @description Event listener registrations that refresh pipeline runtime state when pipeline definitions are saved, updated, or removed.
 * @layer event
 * @owner nPipeline
 * @override Project modules may add or replace pipeline event listeners through later module contributions.
 */
module.exports = {
    common: {
        pipelineSavedListener: {
            event: 'pipelineSave',
            listener: 'DefaultPipelineChangeListenerService.handlePipelineChangeEvent'
        },
        pipelineUpdatedListener: {
            event: 'pipelineUpdated',
            listener: 'DefaultPipelineChangeListenerService.handlePipelineChangeEvent'
        },
        pipelineRemovedListener: {
            event: 'pipelineUpdated',
            listener: 'DefaultPipelineChangeListenerService.handlePipelineRemovedEvent'
        },
    }
};
