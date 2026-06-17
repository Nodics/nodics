const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const utils = require('../src/utils/utils');

let root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-non-runtime-'));
let runtimeModule = path.join(root, 'runtimeModule');
let setupPackage = path.join(root, 'gSetup');
fs.mkdirSync(runtimeModule, { recursive: true });
fs.mkdirSync(setupPackage, { recursive: true });

fs.writeFileSync(path.join(runtimeModule, 'package.json'), JSON.stringify({
    name: 'runtimeModule',
    index: '1.0',
    type: 'core',
    main: 'nodics.js'
}, null, 4));

fs.writeFileSync(path.join(setupPackage, 'package.json'), JSON.stringify({
    name: 'gSetup',
    index: '0.5',
    type: 'setup',
    runtimeModule: false,
    nodics: {
        runtimeModule: false,
        loadableByNodicsModuleLoader: false
    },
    main: 'nodics.js'
}, null, 4));

let modulesList = {};
utils.collectModulesList(root, modulesList);

assert(modulesList.runtimeModule, 'runtime module should be discovered');
assert.strictEqual(modulesList.gSetup, undefined, 'non-runtime setup package should not be discovered as a Nodics module');
assert.strictEqual(utils.isRuntimeModule({ name: 'normal' }), true);
assert.strictEqual(utils.isRuntimeModule({ name: 'disabled', runtimeModule: false }), false);
assert.strictEqual(utils.isRuntimeModule({
    name: 'disabledNested',
    nodics: {
        loadableByNodicsModuleLoader: false
    }
}), false);

fs.rmSync(root, { recursive: true, force: true });

console.log('Non-runtime package discovery validated');
