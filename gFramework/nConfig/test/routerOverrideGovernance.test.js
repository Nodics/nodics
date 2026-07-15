/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module config/test/routerOverrideGovernance
 * @description Verifies additive and replacement router merging across ordered module layers, including route removal, breaking-change warnings, and contribution trace metadata.
 * @layer test
 * @owner nConfig
 * @override Project modules may add route-specific scenarios while preserving generic layered router governance.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-router-override-'));
const baseModulePath = path.join(rootDir, 'baseModule');
const appModulePath = path.join(rootDir, 'appModule');
const replaceModulePath = path.join(rootDir, 'replaceModule');

function writeRouterFile(modulePath, routerFile) {
    let routerDirectory = path.join(modulePath, 'src', 'router');
    fs.mkdirSync(routerDirectory, { recursive: true });
    fs.writeFileSync(path.join(routerDirectory, 'router.js'), routerFile, 'utf8');
}

writeRouterFile(baseModulePath, `
module.exports = {
    profile: {
        users: {
            getUser: {
                key: '/users/:id',
                method: 'GET',
                controller: 'DefaultUserController',
                operation: 'getUser',
                secured: true,
                accessGroups: ['userGroup']
            },
            removeUser: {
                key: '/users/:id',
                method: 'DELETE',
                controller: 'DefaultUserController',
                operation: 'removeUser',
                secured: true
            }
        }
    }
};
`);

writeRouterFile(appModulePath, `
module.exports = {
    profile: {
        users: {
            getUser: {
                controller: 'ProjectUserController',
                operation: 'loadUser'
            },
            createUser: {
                key: '/users',
                method: 'POST',
                controller: 'ProjectUserController',
                operation: 'createUser',
                secured: true
            },
            $override: {
                removeRoutes: ['removeUser']
            }
        }
    }
};
`);

writeRouterFile(replaceModulePath, `
module.exports = {
    profile: {
        users: {
            health: {
                key: '/users/health',
                method: 'GET',
                controller: 'UserHealthController',
                operation: 'check',
                secured: false
            },
            $override: {
                mode: 'replace',
                allowBreakingChanges: true
            }
        }
    }
};
`);

global.NODICS = {
    /** @returns {string} Temporary Nodics home containing test module fixtures. */
    getNodicsHome: function () {
        return rootDir;
    },
    /** @returns {Map<string,Object>} Ordered base and project module fixtures. */
    getIndexedModules: function () {
        return new Map([
            ['1.0', { name: 'baseModule', path: baseModulePath }],
            ['2.0', { name: 'appModule', path: appModulePath }]
        ]);
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const loader = require('../src/service/defaultFilesLoaderService');
let warnings = [];
loader.LOG = {
    /** @returns {void} Ignores debug output during the isolated test. */
    debug: function () {},
    /** @param {string} message Governance warning to capture. @returns {void} */
    warn: function (message) {
        warnings.push(message);
    }
};

let mergedRouters = loader.loadRouterFiles('/src/router/routers.js', null);
assert.strictEqual(mergedRouters.profile.users.getUser.controller, 'ProjectUserController');
assert.strictEqual(mergedRouters.profile.users.getUser.operation, 'loadUser');
assert.strictEqual(mergedRouters.profile.users.getUser.method, 'GET');
assert.strictEqual(mergedRouters.profile.users.removeUser, undefined);
assert.strictEqual(mergedRouters.profile.users.createUser.method, 'POST');
assert.strictEqual(warnings.length, 1);
assert(warnings[0].includes('controller changed'));
assert(warnings[0].includes('operation changed'));
assert.strictEqual(mergedRouters.profile.users.getUser.xNodics.overrideTrace.length, 2);
assert.strictEqual(mergedRouters.profile.users.getUser.xNodics.overrideTrace[1].sourceModule, 'appModule');
assert.deepStrictEqual(mergedRouters.profile.users.xNodics.overrideTrace[1].removedRoutes, ['removeUser']);

global.NODICS.getIndexedModules = function () {
    return new Map([
        ['1.0', { name: 'baseModule', path: baseModulePath }],
        ['3.0', { name: 'replaceModule', path: replaceModulePath }]
    ]);
};
warnings = [];

let replacedRouters = loader.loadRouterFiles('/src/router/routers.js', null);
assert.strictEqual(replacedRouters.profile.users.getUser, undefined);
assert.strictEqual(replacedRouters.profile.users.health.controller, 'UserHealthController');
assert.strictEqual(warnings.length, 0);
assert.strictEqual(replacedRouters.profile.users.health.xNodics.overrideTrace.length, 1);
assert.strictEqual(replacedRouters.profile.users.xNodics.overrideTrace[0].mode, 'replace');

fs.rmSync(rootDir, { recursive: true, force: true });
console.log('Router override governance validated');
