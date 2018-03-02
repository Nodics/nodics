/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
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