const assert = require('assert');

// @nodics-capability-behavior @nodics-area profile
global.CONFIG = {
    get: function (key) {
        if (key === 'defaultTenant') {
            return 'defaultTenant';
        }
        if (key === 'defaultErrorCodes') {
            return {
                NodicsError: 'ERR_SYS_00000'
            };
        }
        return undefined;
    }
};

global.SERVICE = {
    DefaultStatusService: {
        get: function (code) {
            return {
                code: 500,
                message: 'Status message for ' + code
            };
        }
    },
    DefaultAuthorizationProviderService: {
        authorizeToken: function (request) {
            calls.push({ operation: 'authorizeToken', request });
            return Promise.resolve({ code: 'SUC_AUTH_TOKEN' });
        }
    }
};

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
    },
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    extractFromError: function (error, message, defaultCode) {
        return {
            code: defaultCode,
            name: error.name,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message ? error.message + ' : ' + message : error.message,
            stack: error.stack
        };
    },
    extractFromMessage: function (message, defaultCode) {
        return {
            code: defaultCode,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message
        };
    }
};

global.CLASSES = {
    NodicsError: require('../../../gFramework/nCommon/src/lib/nodicsError')
};

const calls = [];
global.FACADE = {
    DefaultAuthenticationProviderFacade: {
        authenticateEmployee: function (request) {
            calls.push({ operation: 'authenticateEmployee', request });
            return Promise.resolve({ code: 'SUC_AUTH_EMPLOYEE' });
        },
        authenticateCustomer: function (request) {
            calls.push({ operation: 'authenticateCustomer', request });
            return Promise.resolve({ code: 'SUC_AUTH_CUSTOMER' });
        }
    },
    DefaultInternalAuthenticationProviderFacade: {
        getInternalAuthToken: function (request) {
            calls.push({ operation: 'getInternalAuthToken', request });
            return Promise.resolve({ code: 'SUC_INTERNAL_TOKEN' });
        }
    },
    DefaultEnterpriseFacade: {
        get: function (request) {
            calls.push({ operation: 'getEnterprise', request });
            return Promise.resolve({ code: 'SUC_ENTERPRISE_GET' });
        }
    },
    DefaultTenantFacade: {
        get: function (request) {
            calls.push({ operation: 'getTenants', request });
            return Promise.resolve({ code: 'SUC_TENANT_GET' });
        }
    },
    DefaultCustomerFacade: {
        isCustomerExist: function (request) {
            calls.push({ operation: 'isCustomerExist', request });
            return Promise.resolve({ code: 'SUC_CUSTOMER_EXISTS' });
        },
        signUp: function (request) {
            calls.push({ operation: 'signUp', request });
            return Promise.resolve({ code: 'SUC_CUSTOMER_SIGNUP' });
        }
    }
};

function httpRequest(headers, body, params) {
    return {
        body: body || {},
        params: params || {},
        get: function (key) {
            return headers[key];
        }
    };
}

const authController = require('../src/controller/authentication/defaultAuthenticationProviderController');
const internalAuthController = require('../src/controller/authentication/defaultInternalAuthenticationProviderController');
const enterpriseController = require('../src/controller/enterprise/defaultEnterpriseController');
const tenantController = require('../src/controller/tenant/defaultTenantController');
const customerController = require('../src/controller/customer/DefaultCustomerController');
const authorizationController = require('../src/controller/authorization/defaultAuthorizationProviderController');

(async function () {
    let employeeRequest = {
        httpRequest: httpRequest({}, {
            loginId: 'employee@example.com',
            password: 'secret',
            source: 'admin'
        })
    };
    await authController.authenticateEmployee(employeeRequest);
    assert.strictEqual(employeeRequest.loginId, 'employee@example.com');
    assert.strictEqual(employeeRequest.password, 'secret');
    assert.strictEqual(employeeRequest.source, 'admin');

    let customerAuthRequest = {
        httpRequest: httpRequest({}, {
            loginId: 'customer@example.com',
            password: 'secret',
            source: 'web'
        })
    };
    await authController.authenticateCustomer(customerAuthRequest);
    assert.strictEqual(customerAuthRequest.loginId, 'customer@example.com');
    assert.strictEqual(customerAuthRequest.password, 'secret');
    assert.strictEqual(customerAuthRequest.source, 'web');

    let internalTokenRequest = {
        httpRequest: httpRequest({}, {}, {
            tntCode: 'electronicsTenant'
        })
    };
    await internalAuthController.getInternalAuthToken(internalTokenRequest);
    assert.strictEqual(internalTokenRequest.tenant, 'electronicsTenant');

    let enterpriseRequest = {
        entCode: 'electronics',
        httpRequest: httpRequest({})
    };
    await enterpriseController.getEnterprise(enterpriseRequest);
    assert.strictEqual(enterpriseRequest.tenant, 'defaultTenant');
    assert.deepStrictEqual(enterpriseRequest.query, { code: 'electronics' });
    assert.strictEqual(enterpriseRequest.options.recursive, true);

    let missingEnterpriseError;
    try {
        await enterpriseController.getEnterprise({
            httpRequest: httpRequest({})
        });
    } catch (error) {
        missingEnterpriseError = error;
    }
    assert(missingEnterpriseError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(missingEnterpriseError.code, 'ERR_PRFL_00003');

    let tenantRequest = {
        tenant: 'defaultTenant',
        httpRequest: httpRequest({})
    };
    await tenantController.getTenants(tenantRequest);

    let customerExistRequest = {
        tenant: 'electronicsTenant',
        httpRequest: httpRequest({}, {
            loginId: 'customer@example.com',
            enterpriseCode: 'electronics'
        })
    };
    await customerController.isCustomerExist(customerExistRequest);
    assert.strictEqual(customerExistRequest.loginId, 'customer@example.com');
    assert.strictEqual(customerExistRequest.enterpriseCode, 'electronics');
    assert.strictEqual(customerExistRequest.tenant, 'electronicsTenant');

    let customerSignUpRequest = {
        tenant: 'electronicsTenant',
        httpRequest: httpRequest({}, {
            loginId: 'new.customer@example.com',
            profile: {
                firstName: 'New'
            }
        })
    };
    await customerController.signUp(customerSignUpRequest);
    assert.deepStrictEqual(customerSignUpRequest.model, {
        loginId: 'new.customer@example.com',
        profile: {
            firstName: 'New'
        }
    });

    let authorizeTokenRequest = {
        httpRequest: httpRequest({}, {
            authToken: 'jwt-token'
        })
    };
    await authorizationController.authorizeToken(authorizeTokenRequest);
    assert.strictEqual(authorizeTokenRequest.authToken, 'jwt-token');

    assert.deepStrictEqual(calls.map(call => call.operation), [
        'authenticateEmployee',
        'authenticateCustomer',
        'getInternalAuthToken',
        'getEnterprise',
        'getTenants',
        'isCustomerExist',
        'signUp',
        'authorizeToken'
    ]);

    console.log('Profile controller request mapping validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
