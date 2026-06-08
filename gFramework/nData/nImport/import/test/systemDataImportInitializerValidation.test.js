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
