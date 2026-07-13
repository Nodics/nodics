/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const path = require('path');

const config = require('../../../nConfig');

const ROOT = path.resolve(__dirname, '../../../..');
const DEFAULT_SERVER = process.env.NODICS_EMS_TEST_SERVER || process.env.SERVER || 'kickoffLocalServer';

function getEnabledPublisher() {
    let clients = CONFIG.get('emsClient').clients || {};
    let publishers = CONFIG.get('emsClient').publishers || {};
    let nodeId = CONFIG.get('nodeId');
    let publisherName = Object.keys(publishers).find(name => {
        let publisher = publishers[name];
        let client = publisher && clients[publisher.client];
        let runsOnCurrentNode = !publisher.runOnNode || publisher.runOnNode === nodeId || publisher.tempNode === nodeId;
        return publisher && publisher.enabled && client && client.enabled && runsOnCurrentNode;
    });

    assert(publisherName, 'No enabled EMS publisher found for the active node');
    return publisherName;
}

async function ensurePublisherQueue(publisherName) {
    let publisher = SERVICE.DefaultEmsClientConfigurationService.getPublisher(publisherName);
    let handlerName = publisher && publisher.client && publisher.client.config && publisher.client.config.handler;
    if (handlerName && SERVICE[handlerName] && typeof SERVICE[handlerName].checkQueue === 'function') {
        await SERVICE[handlerName].checkQueue({
            consumerName: publisherName,
            client: publisher.client
        });
    }
}

async function closeEmsClients() {
    if (!global.SERVICE || !SERVICE.DefaultEmsClientConfigurationService) {
        return;
    }
    let emsClients = SERVICE.DefaultEmsClientConfigurationService.getEmsClients();
    for (let clientName of Object.keys(emsClients || {})) {
        let client = emsClients[clientName];
        try {
            if (client.producer && typeof client.producer.close === 'function') {
                client.producer.close();
            } else if (client.producer && typeof client.producer.disconnect === 'function') {
                await client.producer.disconnect();
            }
        } catch (error) {}
        try {
            if (client.connection && typeof client.connection.close === 'function') {
                client.connection.close();
            } else if (client.connection && typeof client.connection.disconnect === 'function') {
                await client.connection.disconnect();
            }
        } catch (error) {}
        try {
            if (client.connectionManager && typeof client.connectionManager.close === 'function') {
                client.connectionManager.close();
            }
        } catch (error) {}
        try {
            if (client.admin && typeof client.admin.disconnect === 'function') {
                await client.admin.disconnect();
            }
        } catch (error) {}
    }
}

async function initializeRuntime() {
    let options = {
        NODICS_HOME: ROOT,
        defaultServer: DEFAULT_SERVER
    };
    await config.start(options);
    await config.initUtilities(options);
    await config.loadModules();
    await config.initEntities();
    await SERVICE.DefaultEmsClientConfigurationService.configureEMSClients();
    await SERVICE.DefaultEmsClientConfigurationService.configurePublishers();
}

(async function () {
    await initializeRuntime();

    let publisherName = getEnabledPublisher();
    await ensurePublisherQueue(publisherName);
    let result = await SERVICE.DefaultEmsClientService.publish({
        payloads: {
            queue: publisherName,
            message: JSON.stringify({
                tenant: CONFIG.get('defaultTenant') || 'default',
                source: 'activeEmsPublisher.test',
                server: DEFAULT_SERVER,
                createdAt: new Date().toISOString()
            })
        }
    });

    assert.strictEqual(result.code, 'SUC_EMS_00000');
    console.log('EMS publish smoke passed:', publisherName);
})().then(() => {
    return closeEmsClients();
}).catch(error => {
    closeEmsClients().then(() => {
        console.error(error);
        process.exit(1);
    });
});
