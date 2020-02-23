/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_SYS_00000: {
        code: '200',
        message: 'Successfully processed',
    },
    SUC_SYS_00001: {
        code: '200',
        message: 'Successfully processed',
    },

    ERR_SYS_00000: {
        code: '500',
        message: 'Failed due to some internal error',
    },

    ERR_SYS_00001: {
        code: '400',
        message: 'Failed due to validation error',
    },

    ERR_SYS_00002: {
        code: '503',
        message: 'Service not available',
    },

    // HELP router level status codes

    SUC_HLP_00000: {
        code: '200',
        message: 'Help notation successfully provided',
    },

    ERR_HLP_00000: {
        code: '500',
        message: 'Failed to serve help notation',
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

    // Authentication Status configuration 

    SUC_AUTH_00000: {
        code: '200',
        message: 'Successfully authenticated',
    },

    SUC_AUTH_00001: {
        code: '200',
        message: 'Auth token generated successfully',
    },

    ERR_AUTH_00000: {
        code: '401',
        message: 'Authentication failed',
    },
    ERR_AUTH_00001: {
        code: '401',
        message: 'Invalid or expired authorization token',
    },
    ERR_AUTH_00002: {
        code: '400',
        message: 'Invalid authentication parameters'
    },

    // Login related status codes
    ERR_LIN_00000: {
        code: '400',
        message: 'Invalid authentication parameters'
    },
    ERR_LIN_00002: {
        code: '401',
        message: 'Account is currently in locked state or has been disabled'
    },
    ERR_LIN_00003: {
        code: '400',
        message: 'Invalid authentication parameters'
    },

    ERR_ENT_00000: {
        code: '400',
        message: 'Invalid enterprise code'
    },

    ERR_ENT_00001: {
        code: '400',
        message: 'Invalid enterprise code'
    },

    // GET request process status

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

    ERR_FIND_00002: {
        code: '100003',
        description: 'Could not populate nested documents',
        message: 'Could not populate nested documents'
    },

    ERR_FIND_00003: {
        code: '500',
        message: 'Could not execute pre interceptors or validators'
    },
    ERR_FIND_00004: {
        code: '500',
        message: 'Could not execute post interceptors or validators'
    },

    ERR_FIND_00005: {
        code: '100006',
        description: 'Please validate your request, looks not valid',
        message: 'Please validate your request, looks not valid'
    },

    // Cache status codes

    SUC_CACHE_00000: {
        code: '200',
        message: 'Successfully processed'
    },
    SUC_CACHE_00001: {
        code: '200',
        message: 'None schema found for module'
    },
    SUC_CACHE_00002: {
        code: '200',
        message: 'Successfully fulfilled from router cache'
    },

    ERR_CACHE_00000: {
        code: '400',
        message: 'Facing internal application error'
    },

    ERR_CACHE_00001: {
        code: '404',
        message: 'Could not found item in cache'
    },

    ERR_CACHE_00002: {
        code: '400',
        message: 'Please validate your request, looks no configuration contain'
    },

    ERR_CACHE_00003: {
        code: '400',
        message: 'Invalid routerName property to update router cache'
    },
    ERR_CACHE_00004: {
        code: '400',
        message: 'Invalid schemaName property to update item cache'
    },

    ERR_CACHE_00005: {
        code: '404',
        message: 'Could not found router definition'
    },

    ERR_CACHE_00006: {
        code: '400',
        message: 'Cache client has not been configured for this module'
    },

    //Error CronJob 

    SUC_JOB_00000: {
        code: '200',
        message: 'Successfully processed'
    },


    ERR_JOB_00000: {
        code: '400',
        message: 'Failed due to internal error'
    },

    ERR_JOB_00001: {
        code: '400',
        message: 'No jobs to perform requested operation'
    },

    ERR_JOB_00002: {
        code: '400',
        message: 'Invalid job definition'
    },

    ERR_JOB_00003: {
        code: '400',
        message: 'Invalid cron job definition triggers'
    },
    ERR_JOB_00004: {
        code: '400',
        message: 'Job can not be started before its start date'
    },
    ERR_JOB_00005: {
        code: '404',
        message: 'Job already expired'
    },
    ERR_JOB_00006: {
        code: '400',
        message: 'Job already running'
    },
    ERR_JOB_00007: {
        code: '400',
        message: 'Invalid tenant id'
    },

    // Success model save
    SUC_SAVE_00000: {
        code: '200',
        message: 'Successfully processed'
    },

    SUC_SAVE_00001: {
        code: '200',
        message: 'Partially success',
    },


    // Error model save
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

    // Search related status codes
    SUC_SRCH_00000: {
        code: '200',
        message: 'Successfully processed',
    },

    ERR_SRCH_00000: {
        code: '400',
        message: 'Failed due to internal error',
    },

    ERR_SRCH_00001: {
        code: '150001',
        description: 'Search cluster is down or please check configuration',
        message: 'Search cluster is down or please check configuration'
    },

    ERR_SRCH_00002: {
        code: '400',
        message: 'Could not retrieve list of available indexes'
    },

    ERR_SRCH_00003: {
        code: '400',
        message: 'Could not found indexer configuration'
    },

    ERR_SRCH_00004: {
        code: '400',
        message: 'Facing issue while fetching indexer configuration'
    },

    ERR_SRCH_00005: {
        code: '400',
        message: 'Invalid indexName, mismatch with indexer configuration'
    },

    ERR_SRCH_00006: {
        code: '400',
        message: 'While changing indexer state to RUNNING'
    },

    ERR_SRCH_00007: {
        code: '400',
        message: 'Facing issues while executing pre save processors'
    },

    ERR_SRCH_00008: {
        code: '400',
        message: 'Facing issues while executing post save processors'
    },

    ERR_SRCH_00009: {
        code: '400',
        message: 'Facing issues while executing pre interceptors or validators'
    },

    ERR_SRCH_00010: {
        code: '400',
        message: 'Facing issues while executing pre interceptors or validators'
    },

    SUC_RES_00001: {
        code: '200',
        message: 'Successfully granted responsibility',
    },

    //Success CronJob 
    SUC_EVNT_00000: {
        code: '200',
        message: 'Successfully processed'
    },

    SUC_EVNT_00001: {
        code: '200',
        message: 'None of the events available'
    },

    //Success CronJob 
    ERR_EVNT_00000: {
        code: '400',
        message: 'Invalid data'
    },

    ERR_EVNT_00001: {
        code: '110001',
        description: 'Failed to process event',
        message: 'Failed to process event'
    },

    ERR_EVNT_00002: {
        code: '200',
        message: 'Please validate your configuration, looks publishing event is not active currently'
    },

    // SUCCESS STATUS Cache
    SUC_DATA_00000: {
        code: '200',
        description: 'Successfully processed',
        message: 'Successfully processed'
    },

    SUC_DATA_00001: {
        code: '200',
        description: 'Could not find any data to import for given modules',
        message: 'Could not find any data to import for given modules'
    },

    //ERROR STATUS Cache
    ERR_DATA_00000: {
        code: '400',
        message: 'Facing some issues, please try after some time'
    },

    // SUCCESS STATUS Cache
    SUC_IMP_00000: {
        code: '200',
        description: 'Successfully processed',
        message: 'Successfully processed'
    },

    //ERROR STATUS Cache
    ERR_IMP_00000: {
        code: '400',
        message: 'Data import validation error'
    },

    ERR_IMP_00001: {
        code: '400',
        message: 'Could not found any model to import'
    },

    // EMS
    SUC_EMS_00000: {
        code: '200',
        message: 'Successfully processed'
    },

    ERR_EMS_00000: {
        code: '400',
        message: 'Failed due to internal error'
    },
    ERR_EMS_00001: {
        code: '400',
        message: 'Failed to publish message'
    },
    ERR_EMS_00002: {
        code: '400',
        message: 'Invalid or null payload'
    },
    ERR_EMS_00003: {
        code: '503',
        message: 'Not able to establish connection',
    },
    ERR_EMS_00004: {
        code: '400',
        message: 'Invalid configuration',
    },
    ERR_EMS_00005: {
        code: '500',
        message: 'Failed converting message from XML to JSON'
    },

    ERR_EMS_00005: {
        code: '130005',
        description: 'Consumer object can not be null or empty',
        message: 'Consumer object can not be null or empty'
    },

    ERR_EMS_00006: {
        code: '130006',
        description: 'EMS is not active for this module',
        message: 'EMS is not active for this module'
    },
};