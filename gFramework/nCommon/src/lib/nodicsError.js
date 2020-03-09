/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

//https://cloud.google.com/blog/products/api-management/restful-api-design-what-about-errors
//https://nordicapis.com/best-practices-api-error-handling/

/**
 * code - String - fatch all detail from status service
 * error as Error - assign default code and message from status service and name, message, stack from Error
 * error as JSON - code is mandate
 * @param {*} error 
 * @param {*} message 
 */

let assert = require('assert');

module.exports = class NodicsError extends Error {

    constructor(error, message, defaultCode = CONFIG.get('defaultErrorCodes').NodicsError) {
        if (error && error instanceof Error) {
            error = UTILS.extractFromError(error, message, defaultCode);
        } else if ((typeof error === 'string' || error instanceof String) && error.startsWith('ERR_')) {
            error = {
                code: error,
                responseCode: SERVICE.DefaultStatusService.get(error).code,
                message: SERVICE.DefaultStatusService.get(error).message
            };
            if (message) error.message = error.message + ': ' + message;
        } else if (typeof error === 'string' || error instanceof String) {
            error = UTILS.extractFromMessage(error, defaultCode);
        } else if (UTILS.isObject(error)) {
            error = {
                code: error.code,
                responseCode: SERVICE.DefaultStatusService.get(error.code).code,
                message: error.message || SERVICE.DefaultStatusService.get(error.code).message
            };
            if (message) error.message = error.message + ': ' + message;
        }
        assert.ok(error);
        assert.ok(error.code);
        assert.ok(error.message);
        super(error.message);
        super.name = error.name || 'NodicsError';
        this.defaultCode = defaultCode;
        this.code = error.code;
        this.responseCode = error.responseCode;
        this.metadata = error.metadata;
        this.errors = error.errors || [];
        if (error.stack) {
            this.stack = error.stack;
        }
        this.isProcessed = false;
    }

    isProcessed() {
        return this.processed;
    }

    setProcessed(isProcessed) {
        this.isProcessed = isProcessed;
    }

    addAll(errors) {
        let self = this;
        assert.ok(errors && errors.length > 0);
        errors.forEach(error => {
            self.add(error);
        });
    }

    add(error) {
        assert.ok(error);
        if (error instanceof CLASSES.NodicsError) {
            this.errors.push(error);
        } else {
            this.errors.push(new CLASSES.NodicsError(error));
        }
    }

    getErrors() {
        return this.errors;
    }

    toJson(returnStack) {
        let errorsJson = [];
        if (this.getErrors() && this.getErrors().length > 0) {
            this.getErrors().forEach(error => {
                errorsJson.push(error.toJson());
            });
        }
        let errorJson = {
            responseCode: this.responseCode,
            code: this.code,
            name: this.name,
            message: this.message
        };
        if (this.metadata && !UTILS.isBlank(this.metadata)) {
            errorJson.metadata = this.metadata;
        }
        if (this.stack && (returnStack || CONFIG.get('returnErrorStack'))) errorJson.stack = this.stack;
        if (errorsJson && errorsJson.length > 0) {
            errorJson.errors = errorsJson;
        }
        return errorJson;
    }
};