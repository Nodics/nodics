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