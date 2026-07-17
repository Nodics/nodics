/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

let initRequired;

global.SERVICE = {
    DefaultProfileService: {
        isInitRequired: function () {
            return Promise.resolve(true);
        }
    }
};
global.NODICS = {
    setInitRequired: function (flag) {
        initRequired = flag;
    },
    isInitRequired: function () {
        return initRequired;
    }
};

const profileModule = require('../nodics');

profileModule.postInit({}).then(() => {
    assert.strictEqual(initRequired, true);
}).catch(error => {
    console.error(error);
    process.exit(1);
});
