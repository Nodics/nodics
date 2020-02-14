/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
let assert = require('assert');

module.exports = class ErrorPool extends Error {
    constructor(name, description) {
        // Call super to associate message
        super(description || 'This is error pool');
        super.name = name || 'NodicsErrorPool';
        this.errors = [];
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
        if (error instanceof NodicsError) {
            this.errors.push(error);
        } else if (error instanceof Error) {
            this.errors.push(this.createFromError(error));
        } else if (error instanceof String) {
            this.errors.push(this.createFromMessage(error));
        } else if (error instanceof Object) {
            this.errors.push(new NodicsError(error));
        } else {
            throw new Error('Invalid error object');
        }
    }

    createFromError(error) {
        return new NodicsError({
            code: 'ERR_SYS_00000',
            name: error.name,
            message: error.message || SERVICE.DefaultStatusService.get('ERR_SYS_00000').message,
            stack: error.stack
        });
    }

    createFromMessage(error) {
        return new NodicsError({
            code: 'ERR_SYS_00000',
            name: 'NodicsError',
            message: error
        });
    }

    getErrors() {
        return this.errors;
    }

    toJson() {
        let errorsJson = [];
        if (this.getErrors() && this.getErrors().length > 0) {
            this.getErrors().forEach(error => {
                errorsJson.push(error.toJson());
            });
        }
        let errorJson = {
            code: this.code,
            name: super.name,
            message: this.message,
            errors: errorsJson
        };
        if (this.stack && CONFIG.get('returnErrorStack')) errorJson.stack = this.stack;
        errorJson.errors = errorJson;
        return errorJson;
    }
};