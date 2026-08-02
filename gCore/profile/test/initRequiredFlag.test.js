/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
