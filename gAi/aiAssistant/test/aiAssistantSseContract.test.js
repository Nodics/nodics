/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantSseContract
 * @description Verifies authenticated replay cursors, normalized SSE frames, terminal closure, and streaming transport chunks.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const EventEmitter = require('events');
const defaults = require('../config/properties').aiAssistant;
const coordinator = require('../src/service/stream/defaultAiAssistantTurnCoordinatorService');
const sseService = require('../src/service/stream/defaultAiAssistantSseService');
const transport = require('../../aiProviders/src/service/adapter/defaultAiProviderHttpTransportService');

const conversations = [{
    conversationCode: 'conversation-stream', tenantCode: 'tenant-a',
    principalCode: 'employee-a', state: 'ACTIVE'
}];
const turns = [{
    turnCode: 'turn-stream', conversationCode: 'conversation-stream',
    tenantCode: 'tenant-a', principalCode: 'employee-a', state: 'COMPLETED'
}];
const events = [
    {
        eventCode: 'turn-stream-1', conversationCode: 'conversation-stream', turnCode: 'turn-stream',
        tenantCode: 'tenant-a', sequence: 1, eventType: 'TURN_ACCEPTED', createdAt: new Date(), data: {}
    },
    {
        eventCode: 'turn-stream-2', conversationCode: 'conversation-stream', turnCode: 'turn-stream',
        tenantCode: 'tenant-a', sequence: 2, eventType: 'COMPLETED', createdAt: new Date(), data: { finishReason: 'STOP' }
    }
];
function matches(value, query) {
    return Object.keys(query || {}).every(key => {
        if (query[key] && query[key].$gt !== undefined) return value[key] > query[key].$gt;
        return value[key] === query[key];
    });
}
function store(values) {
    return { get: input => Promise.resolve({ result: values.filter(value => matches(value, input.query)) }) };
}
global.CONFIG = { get: name => name === 'aiAssistant' ? defaults : undefined };
global.SERVICE = {
    DefaultAssistantConversationService: store(conversations),
    DefaultAssistantTurnService: store(turns),
    DefaultAssistantTurnEventService: store(events),
    DefaultAssistantMessageService: store([]),
    DefaultAiAssistantTurnCoordinatorService: coordinator
};

class Response extends EventEmitter {
    constructor() {
        super();
        this.headers = {};
        this.frames = [];
        this.headersSent = false;
        this.writableEnded = false;
    }
    setHeader(name, value) { this.headers[name] = value; }
    flushHeaders() { this.headersSent = true; }
    write(value) { this.frames.push(value); return true; }
    end() { this.writableEnded = true; this.emit('close'); }
}
const response = new Response();
const request = {
    tenant: 'tenant-a', conversationCode: 'conversation-stream', turnCode: 'turn-stream',
    authData: { loginId: 'employee-a', principalType: 'human', userGroups: ['employeeUserGroup'] },
    query: {}, httpResponse: response,
    httpRequest: { get: name => name === 'Last-Event-ID' ? 'turn-stream-1' : undefined }
};

sseService.open(request)
    .then(result => {
        assert.strictEqual(result.metadata.responseCommitted, true);
        assert.strictEqual(response.headers['Content-Type'], 'text/event-stream; charset=utf-8');
        assert.strictEqual(response.frames.some(frame => frame.includes('id: turn-stream-2')), true);
        assert.strictEqual(response.frames.some(frame => frame.includes('"eventType":"COMPLETED"')), true);
        assert.strictEqual(response.frames.some(frame => frame.includes('turn-stream-1')), false);
        assert.throws(() => sseService.cursor(Object.assign({}, request, {
            httpRequest: { get: () => 'another-turn-2' }
        })), /Last-Event-ID/);
        const chunks = [
            'event: response.output_text.delta\ndata: {"delta":"Hello"}\n\n',
            'event: response.completed\ndata: {"response":{"id":"r1"}}\n\n'
        ];
        const encoder = new TextEncoder();
        const body = new ReadableStream({
            start(controller) {
                chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
                controller.close();
            }
        });
        const seen = [];
        return transport.request({
            url: 'https://provider.invalid', headers: {}, sse: true,
            timeoutMs: 1000, maximumResponseBytes: 4096,
            transport: () => Promise.resolve({ ok: true, status: 200, body: body }),
            onSseEvent: event => seen.push(event.type)
        }).then(values => {
            assert.deepStrictEqual(seen, ['response.output_text.delta', 'response.completed']);
            assert.strictEqual(values.length, 2);
            console.log('AI Assistant SSE contract validated');
        });
    });
