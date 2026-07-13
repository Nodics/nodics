/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area ems
let publishCalls = [];

global.SERVICE = {
    DefaultEmsClientConfigurationService: {
        getPublisher: function () {
            return {
                publisher: {
                    send: function (payload) {
                        publishCalls.push(payload);
                        return Promise.resolve(true);
                    }
                }
            };
        }
    }
};

global.CONFIG = {
    get: function () {
        return undefined;
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message) {
            super(message || (error && error.message) || error);
            this.code = error && error.code;
        }
    }
};

const kafkaClientService = require('../src/service/kafka/defaultKafkaClientService');

(async function () {
    await kafkaClientService.publish({
        queue: 'profileUpdates',
        messages: [{
            tenant: 'electronics',
            event: 'CUSTOMER_UPDATED'
        }, {
            key: 'customer-1',
            value: {
                code: 'customer-1'
            }
        }, 'plain-message']
    });

    assert.strictEqual(publishCalls.length, 1);
    assert.strictEqual(publishCalls[0].topic, 'profileUpdates');
    assert.deepStrictEqual(publishCalls[0].messages, [{
        value: JSON.stringify({
            tenant: 'electronics',
            event: 'CUSTOMER_UPDATED'
        })
    }, {
        key: 'customer-1',
        value: JSON.stringify({
            code: 'customer-1'
        })
    }, {
        value: 'plain-message'
    }]);

    console.log('Kafka publish capability behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
