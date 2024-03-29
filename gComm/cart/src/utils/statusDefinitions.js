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
    SUC_ORD_00000: {
        code: '200',
        message: 'Operation successfully processed: Order created'
    },

    ERR_ORD_00000: {
        code: '500',
        message: 'Internal server error while creating order'
    },

    ERR_ORD_00001: {
        code: '500',
        message: 'Invalid order creation request'
    }
};