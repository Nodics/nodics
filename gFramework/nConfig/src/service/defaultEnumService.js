/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');
const Enum = require('../../bin/enum');
const fileLoader = require('./defaultFilesLoaderService');

/**
 * @module config/service/DefaultEnumService
 * @description Loads layered enum definitions from active modules and creates runtime
 * Enum instances in the global `ENUMS` registry.
 * @layer service
 * @owner nConfig
 * @override Project modules may add or override enum definitions through
 * `src/utils/enums.js` in later module layers.
 *
 * @property {Object} ENUMS Global enum registry.
 * @property {Object} fileLoader Layered file loader used to merge enum definition files.
 */
module.exports = {

    /**
     * Initializes the enum service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the enum service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Loads enum definitions from all active modules.
     *
     * @returns {void}
     * @sideEffects Populates global `ENUMS` with Enum instances.
     */
    loadEnums: function () {
        let _self = this;
        let enums = global.ENUMS;
        let enumScript = {};
        fileLoader.loadFiles('/src/utils/enums.js', enumScript);
        _.each(enumScript, function (value, key) {
            let _option = _self.createEnumOptions(key, value);
            if (_option) {
                enums[key] = new Enum(value.definition, _option);
            } else {
                enums[key] = new Enum(value.definition);
            }
        });
    },

    /**
     * Creates constructor options for an enum definition.
     *
     * @param {string} key Enum registry key.
     * @param {Object} enumValue Enum definition export.
     * @returns {Object|undefined} Enum options when `_options` is supplied.
     */
    createEnumOptions: function (key, enumValue) {
        if (enumValue._options) {
            let _option = {
                name: enumValue._options.name || key,
                separator: enumValue._options.separator || '|',
                ignoreCase: enumValue._options.ignoreCase || false,
                freez: enumValue._options.freez || false
            };
            if (enumValue._options.endianness) {
                _option.endianness = enumValue._options.endianness;
            }
            return _option;
        }
    }
};
