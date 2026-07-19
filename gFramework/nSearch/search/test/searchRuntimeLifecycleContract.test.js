/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/*
 * @module nSearch/search/test/searchRuntimeLifecycleContract
 * @description Validates search readiness and central shutdown contribution without requiring a live provider.
 * @layer test
 * @owner nSearch/search
 */
const assert = require('assert');

let lifecycleContributors = {};
let readinessContributors = {};
global.SERVICE = {
    DefaultRuntimeLifecycleService: { registerContributor: (name, value) => { lifecycleContributors[name] = value; } },
    DefaultHealthService: { registerReadinessContributor: (name, value) => { readinessContributors[name] = value; } }
};
const definition = require('../src/service/config/defaultSearchConfigurationService');
let active = true;
let closed = 0;
let connection = { close: () => { closed++; return Promise.resolve(); } };
let service = Object.assign({}, definition, { searchEngines: {
    cms: { default: { isActive: () => active, getConnection: () => connection } }
} });

service.init();
assert(lifecycleContributors.searchEngines, 'search lifecycle contributor must be registered');
assert(readinessContributors.searchEngines, 'search readiness contributor must be registered');
assert.strictEqual(service.getSearchReadiness(), true);
active = false;
assert.strictEqual(service.getSearchReadiness(), false);
active = true;
lifecycleContributors.searchEngines.shutdown().then(() => {
    assert.strictEqual(closed, 1);
    assert.deepStrictEqual(service.searchEngines, {});
    console.log('Search runtime lifecycle contract validated');
}).catch(error => { console.error(error); process.exit(1); });
