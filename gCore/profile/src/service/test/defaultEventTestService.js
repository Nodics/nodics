/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/service/test/defaultEventTestService
 * @description Implements profile default event test service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Processes test event behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleTestEvent: function (request, callback) {
        let _self = this;
        _self.LOG.debug('#Event has been Handled ');
        callback(null, {
            code: 'SUC_EVNT_00000',
            message: '====>> Event has been Handled '
        });
    }
};