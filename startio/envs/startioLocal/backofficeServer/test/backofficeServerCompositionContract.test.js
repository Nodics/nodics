/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const properties = require('../config/properties');

/**
 * @module startio/envs/startioLocal/backofficeServer/test/backofficeServerCompositionContract
 * @description Validates the local BackOffice modular server composition without duplicating capability authority.
 * @layer test
 * @owner backofficeServer
 */

assert(properties.activeModules.groups.includes('gExp'), 'BackOffice server must activate the gExp group');
assert(properties.activeModules.modules.includes('backoffice'), 'BackOffice server must activate the backoffice capability');
assert(properties.activeModules.modules.includes('backofficeServer'), 'BackOffice server must activate its server layer');
assert.strictEqual(properties.servers.default.nodes.node0.httpPort, 3060, 'BackOffice node0 must use the assigned local HTTP port');
assert.strictEqual(properties.servers.profile.nodes.node0.httpPort, 3000, 'BackOffice must address the independent local Profile server');
assert.strictEqual(properties.proxy, undefined, 'BackOffice server must not introduce a functional module proxy');
assert.strictEqual(properties.moduleRegistry, undefined, 'Registry authority must remain in gExp/backoffice');

console.log('BackOffice local server composition contract passed');
