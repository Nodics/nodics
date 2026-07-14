/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/test/workflowSampleFlowCatalogContract
 * @description Verifies the module-owned auto, manual, mixed, and multi workflow sample catalogs form valid action/channel graphs for documentation, demos, and full workflow coverage.
 * @layer test
 * @owner workflow
 * @override Project modules may add their own workflow catalogs, but base sample flows must keep heads, actions, decisions, channels, and terminal/default paths aligned.
 */

const assert = require('assert');

global.ENUMS = {
    WorkflowActionType: {
        MANUAL: { key: 'MANUAL' },
        AUTO: { key: 'AUTO' },
        PARALLEL: { key: 'PARALLEL' }
    },
    WorkflowActionPosition: {
        HEAD: { key: 'HEAD' },
        ACTION: { key: 'ACTION' },
        END: { key: 'END' }
    }
};

const catalogs = {
    auto: {
        expectedTypes: ['AUTO'],
        head: require('../data/sample/data/auto/sampleAutoWorkflowHeadData'),
        actions: require('../data/sample/data/auto/sampleAutoWorkflowActionData'),
        channels: require('../data/sample/data/auto/sampleAutoWorkflowChannelData')
    },
    manual: {
        expectedTypes: ['MANUAL'],
        head: require('../data/sample/data/manual/sampleManualWorkflowHeadData'),
        actions: require('../data/sample/data/manual/sampleManualWorkflowActionData'),
        channels: require('../data/sample/data/manual/sampleManualWorkflowChannelData')
    },
    mixed: {
        expectedTypes: ['AUTO', 'MANUAL'],
        head: require('../data/sample/data/mixed/sampleMixWorkflowHeadData'),
        actions: require('../data/sample/data/mixed/sampleMixWorkflowActionData'),
        channels: require('../data/sample/data/mixed/sampleMixWorkflowChannelData')
    },
    multi: {
        expectedTypes: ['MANUAL'],
        head: require('../data/sample/data/multi/sampleMultiWorkflowHeadData'),
        actions: require('../data/sample/data/multi/sampleMultiWorkflowActionData'),
        channels: require('../data/sample/data/multi/sampleMultiWorkflowChannelData'),
        expectedSplitChannels: ['multiSplitOneChannel', 'multiSplitTowChannel']
    }
};

const defaultActions = require('../data/init/data/workflows/defaultWorkflowActionData');
const defaultChannels = require('../data/init/data/workflows/defaultWorkflowChannelData');

function values(records) {
    return Object.keys(records).map(key => records[key]);
}

function indexByCode(records) {
    return values(records).reduce((result, record) => {
        assert(record.code, 'workflow catalog record must define a code');
        assert(!result[record.code], 'duplicate workflow catalog code: ' + record.code);
        result[record.code] = record;
        return result;
    }, {});
}

function assertActionChannels(action, channelsByCode, actionsByCode, catalogName) {
    (action.channels || []).forEach(channelCode => {
        const channel = channelsByCode[channelCode];
        assert(channel, catalogName + ' action ' + action.code + ' references missing channel ' + channelCode);
        assert(channel.active, catalogName + ' channel ' + channelCode + ' must be active');
        assert(channel.qualifier && channel.qualifier.decision, catalogName + ' channel ' + channelCode + ' must declare a decision qualifier');
        assert((action.allowedDecisions || []).includes(channel.qualifier.decision),
            catalogName + ' action ' + action.code + ' must allow channel decision ' + channel.qualifier.decision);
        assert(actionsByCode[channel.target],
            catalogName + ' channel ' + channelCode + ' targets missing action ' + channel.target);
    });
}

Object.keys(catalogs).forEach(catalogName => {
    const catalog = catalogs[catalogName];
    const headRecords = values(catalog.head);
    assert.strictEqual(headRecords.length, 1, catalogName + ' workflow catalog must define exactly one head action');

    const head = headRecords[0];
    const actionsByCode = Object.assign({}, indexByCode(defaultActions), indexByCode(catalog.actions));
    actionsByCode[head.code] = head;
    const channelsByCode = Object.assign({}, indexByCode(defaultChannels), indexByCode(catalog.channels));
    const workflowActions = [head].concat(values(catalog.actions));
    const actionTypes = Array.from(new Set(workflowActions.map(action => action.type))).sort();

    assert.strictEqual(head.position, 'HEAD', catalogName + ' workflow head must be marked as HEAD');
    assert(head.active, catalogName + ' workflow head must be active');
    assert(head.accessGroups && head.accessGroups.includes('workflowUserGroup'), catalogName + ' workflow head must keep workflow user access');
    assert.deepStrictEqual(actionTypes, catalog.expectedTypes.sort(), catalogName + ' workflow action types must match the catalog contract');

    workflowActions.forEach(action => {
        assert(action.active, catalogName + ' action ' + action.code + ' must be active');
        assert(action.allowedDecisions && action.allowedDecisions.length > 0, catalogName + ' action ' + action.code + ' must define allowed decisions');
        assert(action.accessGroups && action.accessGroups.includes('workflowUserGroup'), catalogName + ' action ' + action.code + ' must keep workflow user access');
        assertActionChannels(action, channelsByCode, actionsByCode, catalogName);
        if (action.type === 'AUTO') {
            assert(action.handler, catalogName + ' auto action ' + action.code + ' must declare a handler');
        }
    });

    if (catalog.expectedSplitChannels) {
        catalog.expectedSplitChannels.forEach(channelCode => {
            assert(channelsByCode[channelCode], catalogName + ' split channel must exist: ' + channelCode);
            assert.strictEqual(channelsByCode[channelCode].qualifier.decision, 'SPLIT');
        });
    }
});

console.log('Workflow sample flow catalog contract validated: auto, manual, mixed, multi');
