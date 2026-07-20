/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates reuse of WCMS approval flows and authenticated Staged-to-Online publication handoff. */
const assert = require('assert');
global.ENUMS = {
    WorkflowActionType: { MANUAL: { key: 'MANUAL' }, AUTO: { key: 'AUTO' } },
    WorkflowActionPosition: { HEAD: { key: 'HEAD' } }
};
class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
}
global.CLASSES = { NodicsError: NodicsError };

const pageActions = require('../data/init/data/pages/defaultCmsPageWorkflowActionData');
const pageChannels = require('../data/init/data/pages/defaultCmsPageWorkflowChannelData');
const componentActions = require('../data/init/data/components/defaultCmsComponentWorkflowActionData');
const pageMappings = require('../data/init/data/schema2Workflow/defaultCmsPage2WorkflowData');
const componentMappings = require('../data/init/data/schema2Workflow/defaultCmsComponent2WorkflowData');
assert(pageActions.record1.channels.includes('publishCmsPageChannel'));
assert.strictEqual(pageChannels.record1.target, 'publishCmsPageAction');
assert.strictEqual(pageActions.record2.handler, 'DefaultWcmsPublicationWorkflowService.publish');
assert.strictEqual(componentActions.record2.handler, 'DefaultWcmsPublicationWorkflowService.publish');
assert.deepStrictEqual(Object.values(pageMappings).map(mapping => mapping.schemaName),
    ['cmsPage', 'cmsPageRoute', 'cmsPageTemplate', 'cmsSlotDefinition', 'cmsSite']);
assert.deepStrictEqual(Object.values(componentMappings).map(mapping => mapping.schemaName),
    ['cmsComponent', 'cmsComponentDetail', 'cmsTypeCode', 'cmsTypeCode2Renderer']);
Object.values(Object.assign({}, pageMappings, componentMappings)).forEach(mapping => {
    assert.strictEqual(mapping.carrierDetail.isCarrierReleased, false, 'content change carriers must await business release');
    assert(mapping.includeProperties.includes('versionId'), 'workflow items must retain the changed immutable version');
});

const calls = [];
global.SERVICE = {
    DefaultPublicationLifecycleService: {
        publishApproved: async request => {
            calls.push(['publishApproved', request]);
            return { code: 'release-a', revision: 5, state: 'ONLINE', targetVersion: 'target-release-a' };
        }
    }
};
const bridge = require('../src/service/publication/defaultWcmsPublicationWorkflowService');

(async () => {
    let request = { tenant: 'tenant-a', authData: { principalId: 'approver-a' }, workflowCarrier: {
        code: 'carrier-a', items: [{ code: 'home', versionId: 3 }, { code: 'hero', versionId: 4 }], sourceDetail: { schemaName: 'cmsPage', publication: {
            code: 'release-a', domain: 'cms', rootType: 'pageRoute', rootCode: 'home-route', sourceVersion: '2'
        } }
    } };
    let response = await bridge.publish(request);
    assert.deepStrictEqual(calls.map(call => call[0]), ['publishApproved']);
    assert.deepStrictEqual(calls[0][1].publication.associatedItems.map(item => item.code), ['home', 'hero']);
    assert.deepStrictEqual(calls[0][1].publication.associatedItems.map(item => item.version), ['3', '4']);
    assert.strictEqual(calls[0][1].publication.workflowRef, 'carrier-a');
    assert.strictEqual(response.feedback.state, 'ONLINE');
    await assert.rejects(bridge.publish({ tenant: 'tenant-a', workflowCarrier: { code: 'missing' } }),
        error => error.code === 'CMS_PUBLICATION_WORKFLOW_INPUT_INVALID');
    await assert.rejects(bridge.publish({ tenant: 'tenant-a', workflowCarrier: { code: 'empty', items: [], sourceDetail: {
        publication: { code: 'empty-release' }
    } } }), error => error.code === 'CMS_PUBLICATION_WORKFLOW_INPUT_INVALID');

    let outbound;
    global.CONFIG = { get: key => key === 'cms' ? { publication: { target: {
        moduleName: 'cms', connectionName: 'cmsOnline', connectionType: 'server', nodeId: 'online-node', timeoutMs: 1000, maxAttempts: 2
    }, runtimeRole: 'STAGED' } } : undefined };
    global.NODICS = { getInternalAuthToken: tenant => 'internal-' + tenant };
    SERVICE.DefaultModuleService = {
        buildRequest: options => options,
        fetch: descriptor => { outbound = descriptor; return Promise.resolve({ version: 'target-release-a' }); }
    };
    const transport = require('../../cms/src/service/publication/defaultCmsPublicationModuleTransportService');
    await transport.deploy({ manifest: { code: 'release-a' } }, { tenant: 'tenant-a' });
    assert.strictEqual(outbound.connectionType, 'server');
    assert.strictEqual(outbound.moduleName, 'cms');
    assert.strictEqual(outbound.connectionName, 'cmsOnline');
    assert.strictEqual(outbound.nodeId, 'online-node');
    assert.strictEqual(outbound.header.Authorization, 'Bearer internal-tenant-a');
    assert.strictEqual(outbound.apiName, '/publication/target/deploy');
    assert.strictEqual(outbound.idempotencyKey, 'release-a');

    global.CONFIG = { get: key => key === 'cms' ? { publication: { runtimeRole: 'ONLINE', target: { moduleName: 'cms', connectionName: 'cmsOnline' } } } : undefined };
    assert.throws(() => transport.deploy({ manifest: { code: 'invalid-source' } }, { tenant: 'tenant-a' }),
        error => error.code === 'CMS_PUBLICATION_SOURCE_ROLE_INVALID');

    console.log('WCMS approval-to-publication workflow contract validated');
})().catch(error => { console.error(error); process.exit(1); });
