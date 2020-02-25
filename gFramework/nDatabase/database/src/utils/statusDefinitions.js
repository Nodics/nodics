/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    SUC_FIND_00000: {
        code: '200',
        message: 'Successfully processed',
    },

    ERR_FIND_00000: {
        code: '100000',
        message: 'Facing some issues, Please try after some time',
    },
    ERR_FIND_00001: {
        code: '400',
        message: 'Invalid request parameters'
    },
    ERR_FIND_00003: {
        code: '500',
        message: 'Could not execute pre interceptors or validators'
    },
    ERR_FIND_00004: {
        code: '500',
        message: 'Could not execute post interceptors or validators'
    },



    SUC_SAVE_00000: {
        code: '200',
        message: 'Successfully processed'
    },

    SUC_SAVE_00001: {
        code: '200',
        message: 'Partially success',
    },


    ERR_SAVE_00000: {
        code: '400',
        message: 'Failed to save or update model'
    },

    ERR_SAVE_00001: {
        code: '400',
        message: 'Invalid model to save or update'
    },

    ERR_SAVE_00002: {
        code: '400',
        message: 'Invalid property to build query'
    },

    ERR_SAVE_00003: {
        code: '600003',
        description: 'Model saving partial successfull',
        message: 'Model saving partial successfull'
    },

    ERR_SAVE_00004: {
        code: '600004',
        description: 'Facing issues while executing pre save processors',
        message: 'Facing issues while executing pre save processors'
    },

    ERR_SAVE_00005: {
        code: '500',
        message: 'Facing issues while executing post save processors'
    },

    ERR_SAVE_00006: {
        code: '500',
        message: 'Failed saving nested model'
    },

    // Success Removed
    SUC_DEL_00000: {
        code: '200',
        message: 'Successfully removed'
    },

    ERR_DEL_00000: {
        code: '500',
        message: 'Failed to remove models'
    },

    // Success update
    SUC_UPD_00000: {
        code: '800000',
        description: 'Successfully processed',
        message: 'Successfully processed'
    },

    // Error update
    ERR_UPD_00000: {
        code: '800000',
        description: 'Failed to update items',
        message: 'Failed to update items'
    },

    ERR_UPD_00001: {
        code: '400',
        message: 'Update criteria can not be null or blank'
    },

    ERR_UPD_00002: {
        code: '800002',
        description: 'Update value can not be null or blank',
        message: 'Update value can not be null or blank'
    },

    // Database
    SUC_DBS_00000: {
        code: '200',
        message: 'Successfully processed',
    },

    ERR_DBS_00000: {
        code: '500',
        message: 'Failed due to internal error',
    },

    ERR_DBS_00001: {
        code: '503',
        message: 'Failed due to connectivity issue',
    },


    // Model level status codes
    ERR_MDL_00000: {
        code: '400',
        message: 'Internal model error',
    },
    ERR_MDL_00001: {
        code: '400',
        message: 'Invalid model object',
    },
    ERR_MDL_00002: {
        code: '400',
        message: 'Failed to update doc, Please check your modelSaveOptions',
    },
    ERR_MDL_00003: {
        code: '400',
        message: 'Invalid query object',
    },
    ERR_MDL_00004: {
        code: '400',
        message: 'Invalid version id',
    },
};