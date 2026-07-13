/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module config/test/artifactOverrideTraceability
 * @description Verifies that layered service, facade, controller, pipeline, and related artifact contributions retain ordered source-module override trace metadata.
 * @layer test
 * @owner nConfig
 * @override Project modules may add capability-specific traceability scenarios; the framework contract for ordered contribution history must remain unchanged.
 */
const assert = require('assert');

global.NODICS = {
    getNodicsHome: function () {
        return '/nodics';
    }
};

const loader = require('../src/service/defaultFilesLoaderService');

let serviceArtifact = {
    init: function () {}
};

loader.recordArtifactContribution(serviceArtifact, {
    name: 'DefaultCatalogService',
    layer: 'service',
    sourceModule: 'catalog',
    action: 'create',
    filePath: '/nodics/gFramework/nCatalog/src/service/DefaultCatalogService.js'
});

loader.recordArtifactContribution(serviceArtifact, {
    name: 'DefaultCatalogService',
    layer: 'service',
    sourceModule: 'customerCatalog',
    action: 'override',
    filePath: '/nodics/customer/customerCatalog/src/service/DefaultCatalogService.js'
});

assert.strictEqual(serviceArtifact.xNodics.overrideTrace.length, 2);
assert.strictEqual(serviceArtifact.xNodics.overrideTrace[0].sourceModule, 'catalog');
assert.strictEqual(serviceArtifact.xNodics.overrideTrace[1].sourceModule, 'customerCatalog');
assert.strictEqual(serviceArtifact.xNodics.overrideTrace[1].action, 'override');
assert.strictEqual(serviceArtifact.xNodics.overrideTrace[1].file, './customer/customerCatalog/src/service/DefaultCatalogService.js');

console.log('Artifact override traceability validated');
