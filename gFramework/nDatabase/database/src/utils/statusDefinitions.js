/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    /**
     * Exception codes related to Database operations
     */
    SUC_DBS_00000: {
        code: '200',
        message: 'Operation successfully processed'
    },
    SUC_DBS_00001: {
        code: '200',
        message: 'Operation partially processed'
    },

    ERR_DBS_00000: {
        code: '500',
        message: 'Operation internal server error'
    },
    ERR_DBS_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_DBS_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_DBS_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_DBS_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_DBS_00005: {
        code: '404',
        message: 'Failed to create collection'
    },
    ERR_DBS_00006: {
        code: '404',
        message: 'Failed to create index'
    },
    ERR_DBS_00007: {
        code: '404',
        message: 'Failed to drop index'
    },

    /**
         * Exception codes related to Model operations
         */
    SUC_MDL_00000: {
        code: '200',
        message: 'Operation successfully processed'
    },
    SUC_MDL_00001: {
        code: '200',
        message: 'Operation partially processed'
    },

    ERR_MDL_00000: {
        code: '500',
        message: 'Operation internal server error'
    },
    ERR_MDL_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_MDL_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_MDL_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_MDL_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_MDL_00005: {
        code: '400',
        message: 'Failed to update doc, Please check your modelSaveOptions',
    },

    /**
     * Exception codes related to Model Find operations
     */
    SUC_FIND_00000: {
        code: '200',
        message: 'Operation successfully processed'
    },
    SUC_FIND_00001: {
        code: '200',
        message: 'Operation partially processed'
    },

    ERR_FIND_00000: {
        code: '500',
        message: 'Search internal server error'
    },
    ERR_FIND_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_FIND_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_FIND_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_FIND_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_FIND_00005: {
        code: '500',
        message: 'Could not execute pre interceptors or validators'
    },
    ERR_FIND_00006: {
        code: '500',
        message: 'Could not execute post interceptors or validators'
    },

    /**
     * Exception codes related to Model Save operations
     */
    SUC_SAVE_00000: {
        code: '200',
        message: 'Operation successfully processed'
    },
    SUC_SAVE_00001: {
        code: '200',
        message: 'Operation partially processed'
    },

    ERR_SAVE_00000: {
        code: '500',
        message: 'Search internal server error'
    },
    ERR_SAVE_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_SAVE_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_SAVE_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_SAVE_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_SAVE_00005: {
        code: '500',
        message: 'Facing issues while executing pre save processors'
    },
    ERR_SAVE_00006: {
        code: '500',
        message: 'Facing issues while executing post save processors'
    },
    ERR_SAVE_00007: {
        code: '500',
        message: 'Failed saving nested model'
    },
    ERR_SAVE_00008: {
        code: '400',
        message: 'Invalid property to build query'
    },
    ERR_SAVE_00009: {
        code: '500',
        message: 'Could not execute pre interceptors or validators'
    },
    ERR_SAVE_00010: {
        code: '500',
        message: 'Could not execute post interceptors or validators'
    },
    ERR_SAVE_00011: {
        code: '500',
        message: 'Failed to apply default schema validators'
    },

    /**
     * Exception codes related to Model Remove operations
     */
    SUC_DEL_00000: {
        code: '200',
        message: 'Operation successfully processed'
    },
    SUC_DEL_00001: {
        code: '200',
        message: 'Operation partially processed'
    },

    ERR_DEL_00000: {
        code: '500',
        message: 'Search internal server error'
    },
    ERR_DEL_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_DEL_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_DEL_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_DEL_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_DEL_00005: {
        code: '500',
        message: 'Could not execute pre interceptors or validators'
    },
    ERR_DEL_00006: {
        code: '500',
        message: 'Could not execute post interceptors or validators'
    },

    /**
     * Exception codes related to Model Update operations
     */
    SUC_UPD_00000: {
        code: '200',
        message: 'Operation successfully processed'
    },
    SUC_UPD_00001: {
        code: '200',
        message: 'Operation partially processed'
    },

    ERR_UPD_00000: {
        code: '500',
        message: 'Search internal server error'
    },
    ERR_UPD_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_UPD_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_UPD_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_UPD_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_UPD_00005: {
        code: '500',
        message: 'Could not execute pre interceptors or validators'
    },
    ERR_UPD_00006: {
        code: '500',
        message: 'Could not execute post interceptors or validators'
    }
};