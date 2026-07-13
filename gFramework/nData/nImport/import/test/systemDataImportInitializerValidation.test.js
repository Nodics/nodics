/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.UTILS = {
    isArray: Array.isArray
};
global.CLASSES = {
    DataImportError: function DataImportError(code, message) {
        this.code = code;
        this.message = message;
    }
};

const initializer = require('../src/service/system/defaultSystemDataImportInitializerService');

function createService() {
    return Object.assign({}, initializer, {
        LOG: {
            debug: function () {}
        }
    });
}

function validate(request) {
    let state = {};
    createService().validateRequest(request, {}, {
        error: function (_request, _response, error) {
            state.error = error;
        },
        nextSuccess: function () {
            state.success = true;
        }
    });
    return {
        request: request,
        state: state
    };
}

let missingModules = validate({});
assert.strictEqual(missingModules.state.error.code, 'ERR_IMP_00003');

let nonArrayModules = validate({
    modules: 'profile'
});
assert.strictEqual(nonArrayModules.state.error.code, 'ERR_IMP_00003');

let emptyModules = validate({
    modules: []
});
assert.strictEqual(emptyModules.state.error.code, 'ERR_IMP_00003');

let validModules = validate({
    modules: ['profile']
});
assert.strictEqual(validModules.state.success, true);
assert.deepStrictEqual(validModules.request.data, {});
