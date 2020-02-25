/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_EVNT_00000: {
        code: '200',
        message: 'Event successfully processed'
    },
    SUC_EVNT_00001: {
        code: '200',
        message: 'Event partially processed'
    },
    SUC_EVNT_00002: {
        code: '200',
        message: 'None of the events available'
    },

    ERR_EVNT_00000: {
        code: '500',
        message: 'Event internal server error'
    },
    ERR_EVNT_00001: {
        code: '501',
        message: 'Event not implemented'
    },
    ERR_EVNT_00002: {
        code: '503',
        message: 'Event unavailable currently'
    },
    ERR_EVNT_00003: {
        code: '400',
        message: 'Invalid event request'
    },
    ERR_EVNT_00004: {
        code: '404',
        message: 'Event not found'
    }
};