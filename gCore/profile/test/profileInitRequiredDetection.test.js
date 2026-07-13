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
    NodicsError: function NodicsError(code, message) {
        this.code = code;
        this.message = message;
    }
};

const profileService = require('../src/service/profile/defaultProfileService');

function createService() {
    return Object.assign({}, profileService, {
        LOG: {
            info: function () {}
        }
    });
}

function configureDatabase(collections, enterpriseResponse) {
    global.SERVICE = {
        DefaultDatabaseConfigurationService: {
            getTenantDatabase: function () {
                return {
                    master: {
                        getCollectionList: function () {
                            return collections;
                        }
                    }
                };
            }
        }
    };
    global.NODICS = {
        getModels: function () {
            return {
                EnterpriseModel: {
                    getItems: function () {
                        return Promise.resolve(enterpriseResponse);
                    }
                }
            };
        }
    };
}

async function isInitRequired(collections, enterpriseResponse) {
    configureDatabase(collections, enterpriseResponse);
    return createService().isInitRequired();
}

(async function () {
    assert.strictEqual(await isInitRequired([], undefined), true);
    assert.strictEqual(await isInitRequired(['EnterpriseModel'], { result: [{ code: 'default' }] }), false);
    assert.strictEqual(await isInitRequired(['EnterpriseModel'], { result: [] }), true);
    assert.strictEqual(await isInitRequired(['EnterpriseModel'], [{ code: 'default' }]), false);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
