/**
 * @module gFramework/nEvent/src/service/event/defaultListenerChangeListenerService
 * @description Implements nEvent default listener change listener service business behavior and extension logic.
 * @layer service
 * @owner nEvent
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Processes listener update event behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleListenerUpdateEvent: function (request, callback) {
        try {
            SERVICE.DefaultEventService.handleListenerUpdateEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle listener update handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle listener update handler', 'ERR_EVNT_00000'));
        }
    },

    /**

     * Processes listener removed event behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleListenerRemovedEvent: function (request, callback) {
        try {
            SERVICE.DefaultEventService.handleListenerRemovedEvent(request).then(success => {
                callback(null, { code: 'SUC_EVNT_00000', message: success });
            }).catch(error => {
                callback(new CLASSES.EventError(error, 'Unable to handle listener removed handler', 'ERR_EVNT_00000'));
            });
        } catch (error) {
            callback(new CLASSES.EventError(error, 'Unable to handle listener removed handler', 'ERR_EVNT_00000'));
        }
    }
};