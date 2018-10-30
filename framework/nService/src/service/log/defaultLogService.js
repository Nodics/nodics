/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    changeLogLevel: function (request) {
        if (SYSTEM.changeLogLevel(request)) {
            this.LOG.debug('Log level have been set successfully');
            return Promise.resolve(true);
        } else {
            this.LOG.error('Log level have been set successfully');
            return Promise.reject(true);
        }
    }
};