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
