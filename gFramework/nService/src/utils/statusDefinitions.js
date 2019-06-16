/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_SYS_00000: {
        code: '000000',
        description: 'Successfully processed',
        message: 'Successfully processed',
    },

    ERR_SYS_00000: {
        code: '000000',
        description: 'Failed due to some internal error',
        message: 'Failed due to some internal error',
    },
    // SUCCESS STATUS FIND
    SUC_FIND_00000: {
        code: '100000',
        description: 'Successfully processed',
        message: 'Successfully processed',
    },

    // ERROR STATUS FIND
    ERR_FIND_00000: {
        code: '100000',
        description: 'Facing some issues, Please try after some time',
        message: 'Facing some issues, Please try after some time',
    },

    ERR_FIND_00001: {
        code: '100001',
        description: 'Invalid projection value to return list of properties',
        message: 'Invalid projection value to return list of properties'
    },

    ERR_FIND_00002: {
        code: '100002',
        description: 'Invalid sort options',
        message: 'Invalid sort options',
    },

    ERR_FIND_00003: {
        code: '100003',
        description: 'Could not populate nested documents',
        message: 'Could not populate nested documents'
    },

    ERR_FIND_00004: {
        code: '100004',
        description: 'Could not execute pre interceptors',
        message: 'Could not execute pre interceptors'
    },
    ERR_FIND_00005: {
        code: '100005',
        description: 'Could not execute post interceptors',
        message: 'Could not execute post interceptors'
    },

    ERR_FIND_00006: {
        code: '100006',
        description: 'Please validate your request, looks not valid',
        message: 'Please validate your request, looks not valid'
    },

    // Success Auth token 
    SUC_AUTH_00000: {
        code: '300000',
        description: 'Successfully processed',
        message: 'Successfully processed',
    },

    // Error Auth Token 
    ERR_AUTH_00000: {
        code: '300000',
        description: 'Failed authentication',
        message: 'Failed authentication',
    },

    ERR_AUTH_00001: {
        code: '300001',
        description: 'Authentication failed: Invalid auth token',
        message: 'Authentication failed: Invalid auth token',
    },

    ERR_AUTH_00002: {
        code: '300002',
        description: 'Invalid request',
        message: 'Invalid request'
    },

    ERR_AUTH_00003: {
        code: '300003',
        description: 'Authentication failed: Invalid api key',
        message: 'Authentication failed: Invalid api key',
    },

    ERR_ENT_00000: {
        code: '400000',
        description: 'Invalid enterprise code',
        message: 'Invalid enterprise code'
    },

    RR_TNT_00000: {
        code: '400001',
        description: 'Invalid tenant id',
        message: 'Invalid tenant id'
    },

    ERR_EMP_00000: {
        code: '400001',
        description: 'Invalid employee code',
        message: 'Invalid employee code'
    },

    ERR_CUST_00000: {
        code: '400001',
        description: 'Invalid customer code',
        message: 'Invalid customer code'
    },

    ERR_LIN_00000: {
        code: '500000',
        description: 'Invalid login Id',
        message: 'Invalid login Id'
    },

    ERR_LIN_00001: {
        code: '500001',
        description: 'Invalid password',
        message: 'Invalid password'
    },

    ERR_LIN_00002: {
        code: '500002',
        description: 'Account is currently in locked state or has been disabled',
        message: 'Account is currently in locked state or has been disabled'
    },

    ERR_LIN_00003: {
        code: '500003',
        description: 'Invalid authentication request : Given password is not valid',
        message: 'Invalid authentication request : Given password is not valid'
    },

    // Success model save
    SUC_SAVE_00000: {
        code: '600000',
        description: 'Successfully processed',
        message: 'Successfully processed'
    },


    // Error model save
    ERR_SAVE_00000: {
        code: '600000',
        description: 'Failed to save or update model',
        message: 'Failed to save or update model'
    },

    ERR_SAVE_00001: {
        code: '600001',
        description: 'Invalid model to save or update',
        message: 'Invalid model to save or update'
    },

    ERR_SAVE_00002: {
        code: '600002',
        description: 'Invalid property to build query',
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
        code: '600005',
        description: 'Facing issues while executing post save processors',
        message: 'Facing issues while executing post save processors'
    },

    ERR_SAVE_00006: {
        code: '600006',
        description: 'Failed saving nested model',
        message: 'Failed saving nested model'
    },

    // Success Removed
    SUC_DEL_00000: {
        code: '700000',
        description: 'Successfully processed',
        message: 'Successfully processed'
    },


    // Error Removed
    ERR_DEL_00000: {
        code: '700000',
        description: 'Failed to remove models',
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
        code: '800001',
        description: 'Update criteria can not be null or blank',
        message: 'Update criteria can not be null or blank'
    },

    ERR_UPD_00002: {
        code: '800002',
        description: 'Update value can not be null or blank',
        message: 'Update value can not be null or blank'
    },

    //Success CronJob 
    SUC_JOB_00000: {
        code: '900000',
        description: 'Successfully processed',
        message: 'Successfully processed'
    },


    //Error CronJob 
    ERR_JOB_00000: {
        code: '900000',
        description: 'Failed to perform requested operation',
        message: 'Failed to perform requested operation'
    },

    ERR_JOB_00001: {
        code: '900001',
        description: 'No jobs to perform requested operation',
        message: 'No jobs to perform requested operation'
    },

    ERR_JOB_00002: {
        code: '900002',
        description: 'Invalid job definition',
        message: 'Invalid job definition'
    },

    ERR_JOB_00003: {
        code: '900003',
        description: 'Invalid cron job definition triggers',
        message: 'Invalid cron job definition triggers'
    },
    ERR_JOB_00004: {
        code: '900004',
        description: 'Job can not be started before its start date',
        message: 'Job can not be started before its start date'
    },
    ERR_JOB_00005: {
        code: '900005',
        description: 'Job already expired',
        message: 'Job already expired'
    },
    ERR_JOB_00006: {
        code: '900006',
        description: 'Job already running',
        message: 'Job already running'
    },

    //Success CronJob 
    SUC_EVNT_00000: {
        code: '110000',
        description: 'Successfully processed',
        message: 'Successfully processed'
    },

    SUC_EVNT_00001: {
        code: '110001',
        description: 'None of the events available',
        message: 'None of the events available'
    },

    //Success CronJob 
    ERR_EVNT_00000: {
        code: '110000',
        description: 'Failed to process event',
        message: 'Failed to process event'
    },

    ERR_EVNT_00001: {
        code: '110001',
        description: 'Failed to process event',
        message: 'Failed to process event'
    },

    ERR_EVNT_00002: {
        code: '110002',
        description: 'Please validate your configuration, looks publishing event is not active currently',
        message: 'Please validate your configuration, looks publishing event is not active currently'
    },
};