/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

//https://cloud.google.com/blog/products/api-management/restful-api-design-what-about-errors
//https://nordicapis.com/best-practices-api-error-handling/

/**
 * code - String - fatch all detail from status service
 * error as Error - assign default code and message from status service and name, message, stack from Error
 * error as JSON - code is mandate
 * @param {*} error 
 * @param {*} message 
 */

let assert = require('assert');
const flatted = require('flatted');

/**
 * @module common/lib/NodicsError
 * @description Standard Nodics error type used across pipelines, services, controllers,
 * generated APIs, imports, processors, and interceptors. It preserves response code,
 * status code, metadata, nested causes, validation errors, trace id, contexts, and
 * safe JSON serialization.
 * @layer lib
 * @owner nCommon
 * @override Project modules should enrich this error with context rather than replace it.
 * If replacement is required, preserve `toJson`, `ensure`, `enrich`, `contexts`, `causes`,
 * and `errors` contracts so API and pipeline error responses remain consistent.
 *
 * @property {string} code Nodics status/error code.
 * @property {number} responseCode HTTP response code resolved from status service.
 * @property {Object} metadata Optional structured diagnostic metadata.
 * @property {Object[]} contexts Ordered execution contexts added while error propagates.
 * @property {NodicsError[]} causes Nested causal errors.
 * @property {NodicsError[]} errors Aggregated validation or batch errors.
 * @property {string} traceId Optional correlation id.
 */
module.exports = class NodicsError extends Error {

    /**
     * Creates a normalized Nodics error from an error code, string, Error, or object.
     *
     * @param {string|Error|Object} error Error input.
     * @param {string} [message] Additional message context.
     * @param {string} [defaultCode] Fallback Nodics error code.
     * @throws Assertion error when a code or message cannot be resolved.
     */
    constructor(error, message, defaultCode = CONFIG.get('defaultErrorCodes').NodicsError) {
        if (error && !error.code && error instanceof Error) {
            error = UTILS.extractFromError(error, message, defaultCode);
        } else if ((typeof error === 'string' || error instanceof String) && error.startsWith('ERR_')) {
            error = {
                code: error,
                responseCode: SERVICE.DefaultStatusService.get(error).code,
                message: SERVICE.DefaultStatusService.get(error).message
            };
            if (message) error.message = error.message + ': ' + message;
        } else if (typeof error === 'string' || error instanceof String) {
            error = UTILS.extractFromMessage(error, defaultCode);
        } else if (UTILS.isObject(error)) {
            error = {
                code: error.code,
                responseCode: SERVICE.DefaultStatusService.get(error.code).code,
                message: error.message || SERVICE.DefaultStatusService.get(error.code).message,
                name: error.name,
                metadata: error.metadata,
                contexts: error.contexts,
                causes: error.causes,
                errors: error.errors,
                stack: error.stack,
                traceId: error.traceId
            };
            if (message) error.message = error.message + ': ' + message;
        }
        assert.ok(error);
        assert.ok(error.code);
        assert.ok(error.message);
        super(error.message);
        super.name = error.name || 'NodicsError';
        this.defaultCode = defaultCode;
        this.code = error.code;
        this.responseCode = error.responseCode || SERVICE.DefaultStatusService.get(defaultCode).code;
        this.metadata = error.metadata;
        this.contexts = error.contexts || [];
        this.causes = error.causes || [];
        this.traceId = error.traceId;
        this.errors = error.errors || [];
        if (error.stack) {
            this.stack = error.stack;
        }
        this.processed = false;
    }

    /**
     * Indicates whether this error has already been processed by an error handler.
     *
     * @returns {boolean} Processed flag.
     */
    isProcessed() {
        return this.processed;
    }

    /**
     * Updates processed flag.
     *
     * @param {boolean} processed Processed state.
     * @returns {void}
     */
    setProcessed(processed) {
        this.processed = processed;
    }

    /**
     * Adds multiple nested errors to this error.
     *
     * @param {Array<string|Error|Object|NodicsError>} errors Errors to aggregate.
     * @returns {void}
     */
    addAll(errors) {
        let self = this;
        assert.ok(errors && errors.length > 0);
        errors.forEach(error => {
            self.add(error);
        });
    }

    /**
     * Adds one nested error to this error.
     *
     * @param {string|Error|Object|NodicsError} error Error to aggregate.
     * @returns {void}
     */
    add(error) {
        assert.ok(error);
        if (error instanceof CLASSES.NodicsError) {
            this.errors.push(error);
        } else {
            this.errors.push(new CLASSES.NodicsError(error));
        }
    }

    /**
     * Adds structured execution context after removing blank values.
     *
     * @param {Object} context Context details such as layer, handler, tenant, module, or schema.
     * @returns {NodicsError} Current error for chaining.
     */
    addContext(context) {
        if (context && UTILS.isObject(context)) {
            this.contexts.push(this.constructor.cleanContext(context));
        }
        return this;
    }

    /**
     * Adds a causal error to this error.
     *
     * @param {string|Error|Object|NodicsError} error Causal error.
     * @returns {NodicsError} Current error for chaining.
     */
    addCause(error) {
        assert.ok(error);
        if (error instanceof CLASSES.NodicsError) {
            this.causes.push(error);
        } else {
            this.causes.push(new CLASSES.NodicsError(error));
        }
        return this;
    }

    /**
     * Returns aggregated nested errors.
     *
     * @returns {NodicsError[]} Aggregated errors.
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Serializes this error into a safe API response payload.
     *
     * @param {boolean} [returnStack] Whether to include stack traces.
     * @param {WeakSet} [visited] Internal circular-reference guard.
     * @returns {Object} JSON-safe error payload.
     */
    toJson(returnStack, visited) {
        visited = visited || new WeakSet();
        if (visited.has(this)) {
            return {
                responseCode: this.responseCode,
                code: this.code,
                name: this.name,
                message: this.message,
                circular: true
            };
        }
        visited.add(this);

        let errorJson = {
            responseCode: this.responseCode,
            code: this.code,
            name: this.name,
            message: this.message
        };
        if (this.traceId) {
            errorJson.traceId = this.traceId;
        }
        if (this.metadata && !UTILS.isBlank(this.metadata)) {
            errorJson.metadata = this.constructor.toSafeJson(this.metadata);
        }
        if (this.contexts && this.contexts.length > 0) {
            errorJson.contexts = this.contexts.map(context => this.constructor.toSafeJson(context));
        }
        if (this.causes && this.causes.length > 0) {
            errorJson.causes = this.causes.map(error => this.constructor.serializeNestedError(error, returnStack, visited));
        }
        if (this.errors && this.errors.length > 0) {
            errorJson.errors = this.errors.map(error => this.constructor.serializeNestedError(error, returnStack, visited));
        }
        if (this.stack && (returnStack || CONFIG.get('returnErrorStack'))) errorJson.stack = this.stack;
        return errorJson;
    }

    /**
     * Serializes a nested error while preserving NodicsError detail when available.
     *
     * @param {*} error Nested error value.
     * @param {boolean} returnStack Whether to include stack traces.
     * @param {WeakSet} visited Circular-reference guard.
     * @returns {*} JSON-safe nested error.
     */
    static serializeNestedError(error, returnStack, visited) {
        if (!error) {
            return error;
        }
        if (error.toJson) {
            return error.toJson(returnStack, visited);
        }
        return this.toSafeJson(error);
    }

    /**
     * Converts any value to a JSON-safe representation.
     *
     * @param {*} value Value to serialize.
     * @returns {*} JSON-safe value.
     */
    static toSafeJson(value) {
        try {
            let visited = new WeakSet();
            return JSON.parse(JSON.stringify(value, (key, item) => {
                if (item instanceof Error) {
                    return {
                        name: item.name,
                        message: item.message,
                        stack: item.stack
                    };
                }
                if (item && typeof item === 'object') {
                    if (visited.has(item)) {
                        return { circular: true };
                    }
                    visited.add(item);
                }
                if (typeof item === 'function') {
                    return undefined;
                }
                return item;
            }));
        } catch (error) {
            try {
                return flatted.toJSON(value);
            } catch (flattedError) {
                return {
                    name: value && value.name,
                    message: value && value.message ? value.message : String(value)
                };
            }
        }
    }

    /**
     * Removes blank values from an error context object.
     *
     * @param {Object} context Raw context.
     * @returns {Object} Cleaned context.
     */
    static cleanContext(context) {
        let cleaned = {};
        Object.keys(context || {}).forEach(key => {
            if (context[key] !== undefined && context[key] !== null && context[key] !== '') {
                cleaned[key] = context[key];
            }
        });
        return cleaned;
    }

    /**
     * Ensures an input is a NodicsError.
     *
     * @param {string|Error|Object|NodicsError} error Error input.
     * @param {string} [message] Additional message context.
     * @param {string} [defaultCode] Fallback Nodics error code.
     * @returns {NodicsError} Normalized NodicsError.
     */
    static ensure(error, message, defaultCode) {
        if (error instanceof CLASSES.NodicsError) {
            if (message) {
                error.message = error.message + ': ' + message;
            }
            return error;
        }
        return new CLASSES.NodicsError(error, message, defaultCode);
    }

    /**
     * Ensures an error and appends execution context.
     *
     * @param {string|Error|Object|NodicsError} error Error input.
     * @param {Object} context Execution context.
     * @param {string} [defaultCode] Fallback Nodics error code.
     * @param {string} [message] Additional message context.
     * @returns {NodicsError} Enriched NodicsError.
     */
    static enrich(error, context, defaultCode, message) {
        error = this.ensure(error, message, defaultCode);
        error.addContext(context);
        return error;
    }
};
