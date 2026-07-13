/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
