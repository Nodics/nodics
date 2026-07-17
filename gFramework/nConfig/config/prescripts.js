/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module config/config/prescripts
 * @description Baseline pre-start script contributions for nConfig. The default script installs legacy string-case helpers required by loaders and generated artifact naming before other modules initialize.
 * @layer config
 * @owner nConfig
 * @override Later modules may contribute additional pre-scripts through the layered script loader. Replacements must run before code that relies on these compatibility helpers.
 */
module.exports = {
    /**
     * Installs string case-conversion and replacement helpers used by legacy generation and loader code.
     *
     * @returns {void}
     * @sideEffects Adds helper functions to `String.prototype` for the current Node.js process.
     */
    addStringCamelCaseFunction: function() {
        String.prototype.toUpperCaseFirstChar = function() {
            return this.substr(0, 1).toUpperCase() + this.substr(1);
        };

        String.prototype.toLowerCaseFirstChar = function() {
            return this.substr(0, 1).toLowerCase() + this.substr(1);
        };

        String.prototype.toUpperCaseEachWord = function(delim) {
            delim = delim ? delim : ' ';
            return this.split(delim).map(function(v) {
                return v.toUpperCaseFirstChar();
            }).join(delim);
        };

        String.prototype.toLowerCaseEachWord = function(delim) {
            delim = delim ? delim : ' ';
            return this.split(delim).map(function(v) {
                return v.toLowerCaseFirstChar();
            }).join(delim);
        };

        String.prototype.replaceAll = function(match, replace) {
            return this.replace(new RegExp(match, 'g'), replace);
        };
    }
};
