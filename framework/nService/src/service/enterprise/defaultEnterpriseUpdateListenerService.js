/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    handleEnterpriseSave: function (event, callback) {
        console.log('--------------------------------------------------');
        callback(null, {
            success: true,
            code: 'SUC_SYS_00000',
            msg: 'Successfully Saved enterprise'
        });
        /*if (event.params && event.params.length >= 3) {
            let model = null;
            event.params.forEach(element => {
                if (element.key === 'data') {
                    model = element.value;
                }
            });
            if (model && model.tenant) {
                if (model.active && model.tenant.active) {
                    SYSTEM.buildEnterprise([model]).then(success => {
                        callback(null, {
                            success: true,
                            code: 'SUC_SYS_00000',
                            msg: 'Successfully removed enterprise'
                        });
                    }).catch(error => {
                        callback({
                            success: false,
                            code: 'ERR_EVNT_00000',
                            error: error
                        });
                    });
                } else {
                    SYSTEM.removeEnterprise([model]).then(success => {
                        callback(null, {
                            success: true,
                            code: 'SUC_SYS_00000',
                            msg: 'Successfully removed enterprise'
                        });
                    }).catch(error => {
                        callback({
                            success: false,
                            code: 'ERR_EVNT_00000',
                            error: error
                        });
                    });
                }
            } else {
                this.LOG.error('Invalid enterprise model value');
                callback({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    msg: 'Invalid enterprise model value'
                });
            }
        }*/
    },

    handleEnterpriseUpdate: function (event, callback) {
        console.log('--------------------------------------------------1');
        callback(null, {
            success: true,
            code: 'SUC_SYS_00000',
            msg: 'Successfully updated enterprise'
        });
    },

    handleEnterpriseRemove: function (event, callback) {
        console.log('--------------------------------------------------2');
        callback(null, {
            success: true,
            code: 'SUC_SYS_00000',
            msg: 'Successfully removed enterprise'
        });
    }
};