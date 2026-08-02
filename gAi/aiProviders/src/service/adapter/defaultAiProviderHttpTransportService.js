/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/service/adapter/DefaultAiProviderHttpTransportService
 * @description Provides bounded backend HTTP and SSE transport without owning vendor request translation.
 * @layer service
 * @owner aiProviders
 * @override Projects may replace network transport while preserving timeout, cancellation, size, and redaction rules.
 */
module.exports = {
    /** Reads only bounded machine-readable provider error classification fields. */
    readErrorMetadata: async function (response, maximumResponseBytes) {
        let text = '';
        try {
            text = await response.text();
        } catch (error) {
            return {};
        }
        if (Buffer.byteLength(text) > maximumResponseBytes) return {};
        try {
            const payload = JSON.parse(text);
            const providerError = payload && payload.error || {};
            return {
                providerErrorCode: typeof providerError.code === 'string' ? providerError.code :
                    (typeof providerError.type === 'string' ? providerError.type : undefined)
            };
        } catch (error) {
            return {};
        }
    },

    /** Parses a complete SSE payload into typed JSON event objects. */
    parseSse: function (text) {
        return String(text || '').split(/\r?\n\r?\n/).map(block => {
            const lines = block.split(/\r?\n/);
            const event = (lines.find(line => line.startsWith('event:')) || '').slice(6).trim();
            const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n');
            if (!data || data === '[DONE]') return undefined;
            try {
                const value = JSON.parse(data);
                if (event && !value.type) value.type = event;
                return value;
            } catch (error) {
                throw new Error('AI provider returned malformed SSE data');
            }
        }).filter(Boolean);
    },

    /** Executes a bounded JSON or SSE provider request through injected/global fetch. */
    request: async function (input) {
        const transport = input.transport || global.fetch;
        if (typeof transport !== 'function') throw new Error('AI provider HTTP transport is unavailable');
        const controller = new AbortController();
        const externalSignal = input.signal;
        let timedOut = false;
        const abort = () => controller.abort(externalSignal && externalSignal.reason);
        if (externalSignal) {
            if (externalSignal.aborted) abort();
            else externalSignal.addEventListener('abort', abort, { once: true });
        }
        const timer = setTimeout(() => {
            timedOut = true;
            controller.abort(new Error('AI provider request timed out'));
        }, input.timeoutMs);
        try {
            const response = await transport(input.url, {
                method: input.method || 'POST', headers: input.headers,
                body: input.body === undefined ? undefined : JSON.stringify(input.body), signal: controller.signal
            });
            if (!response.ok) {
                const metadata = await this.readErrorMetadata(response, input.maximumResponseBytes);
                const error = new Error('AI provider request failed with status ' + response.status);
                error.status = response.status;
                error.providerErrorCode = metadata.providerErrorCode;
                error.retryable = response.status === 408 || response.status === 429 || response.status >= 500;
                throw error;
            }
            if (input.sse && response.body && typeof response.body.getReader === 'function') {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                const events = [];
                let buffer = '';
                let bytes = 0;
                const consume = async block => {
                    const parsed = this.parseSse(block);
                    for (const event of parsed) {
                        events.push(event);
                        if (typeof input.onSseEvent === 'function') await input.onSseEvent(event);
                    }
                };
                while (true) {
                    const chunk = await reader.read();
                    if (chunk.done) break;
                    bytes += chunk.value.byteLength;
                    if (bytes > input.maximumResponseBytes) {
                        await reader.cancel();
                        throw new Error('AI provider response exceeded configured byte limit');
                    }
                    buffer += decoder.decode(chunk.value, { stream: true });
                    const blocks = buffer.split(/\r?\n\r?\n/);
                    buffer = blocks.pop();
                    for (const block of blocks) await consume(block);
                }
                buffer += decoder.decode();
                if (buffer.trim()) await consume(buffer);
                return events;
            }
            const text = await response.text();
            if (Buffer.byteLength(text) > input.maximumResponseBytes) {
                throw new Error('AI provider response exceeded configured byte limit');
            }
            if (input.sse) {
                const events = this.parseSse(text);
                if (typeof input.onSseEvent === 'function') {
                    for (const event of events) await input.onSseEvent(event);
                }
                return events;
            }
            try {
                return JSON.parse(text);
            } catch (error) {
                const invalid = new Error('AI provider returned malformed JSON data');
                invalid.transportFailureType = 'RESPONSE_INVALID';
                throw invalid;
            }
        } catch (error) {
            if (timedOut) {
                const timeout = new Error('AI provider request timed out');
                timeout.transportFailureType = 'TIMEOUT';
                timeout.retryable = true;
                throw timeout;
            }
            throw error;
        } finally {
            clearTimeout(timer);
            if (externalSignal) externalSignal.removeEventListener('abort', abort);
        }
    }
};
