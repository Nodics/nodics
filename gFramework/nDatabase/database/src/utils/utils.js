/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDatabase/database/src/utils/utils
 * @description Provides shared nDatabase utility exports for utils.
 * @layer utils
 * @owner nDatabase
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Validates object rules.

     *

     * @param {*} value Method input.

     * @returns {*} Method result.

     */

    isObject: function (value) {
        return Object.prototype.toString.call(value) == "[object Object]";
    },

    /**

     * Validates array rules.

     *

     * @param {*} value Method input.

     * @returns {*} Method result.

     */

    isArray: function (value) {
        return value instanceof Array;
    },

    /**

     * Validates blank array rules.

     *

     * @param {*} value Method input.

     * @returns {*} Method result.

     */

    isBlankArray: function (value) {
        return (value instanceof Array && !value[0]);
    },

    /**

     * Validates array of object rules.

     *

     * @param {*} value Method input.

     * @returns {*} Method result.

     */

    isArrayOfObject: function (value) {
        return this.isArray(value) && this.isObject(value[0]) && !this.isObjectId(value[0]);
    },

    /**

     * Validates object id rules.

     *

     * @param {*} value Method input.

     * @returns {*} Method result.

     */

    isObjectId: function (value) {
        return (this.isObject(value) && value._bsontype && value._bsontype === 'ObjectID');
    },

    /**

     * Updates model name information.

     *

     * @param {*} modelName Method input.

     * @returns {*} Method result.

     */

    createModelName: function (modelName) {
        var name = modelName.toUpperCaseFirstChar() + 'Model';
        return name;
    },

    /**

     * Retrieves model name information.

     *

     * @param {*} modelName Method input.

     * @returns {*} Method result.

     */

    getModelName: function (modelName) {
        var name = modelName.toUpperCaseFirstChar().replace("Model", "");
        return name;
    },
};