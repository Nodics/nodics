/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nPipeline/utils/statusDefinitions
 * @description Status and error definitions for pipeline execution and pipeline-definition validation.
 * @layer data
 * @owner nPipeline
 * @override Project modules may contribute additional pipeline status definitions or localized messages through later modules.
 */
module.exports = {

    SUC_PIPE_00000: {
        code: '200',
        message: 'Request successfully processed'
    },

    ERR_PIPE_00000: {
        code: '500',
        message: 'Invalid pipeline definition'
    },
};
