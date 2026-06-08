/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    init: function () {
        return Promise.resolve(true);
    },

    postInit: function () {
        return Promise.resolve(true);
    },

    ensureSummary: function (request) {
        if (!request.importRun) {
            return null;
        }
        request.importRun.summary = request.importRun.summary || {};
        ['recordsRead', 'recordsFinalized', 'recordsDispatched', 'recordsSucceeded', 'recordsFailed', 'recordsSkipped'].forEach(key => {
            if (request.importRun.summary[key] === undefined) {
                request.importRun.summary[key] = 0;
            }
        });
        return request.importRun.summary;
    },

    increment: function (request, key, count) {
        let summary = this.ensureSummary(request);
        if (summary) {
            summary[key] = (summary[key] || 0) + (count || 0);
        }
    },

    addFailure: function (request, failure) {
        let summary = this.ensureSummary(request);
        if (summary) {
            summary.recordsFailed = (summary.recordsFailed || 0) + 1;
        }
        if (request.importRun) {
            request.importRun.failures = request.importRun.failures || [];
            request.importRun.failures.push(this.normalizeFailure(request, failure));
        }
    },

    normalizeError: function (error) {
        if (!error) {
            return undefined;
        }
        if (error.toJson && typeof error.toJson === 'function') {
            return error.toJson(false);
        }
        return {
            code: error.code || error.errorCode,
            message: error.message || error.toString(),
            name: error.name,
            metadata: error.metadata,
            contexts: error.contexts,
            errors: error.errors
        };
    },

    buildFailureContext: function (request, failure) {
        let context = {
            layer: 'import',
            runId: request.importRun && request.importRun.runId,
            dataType: request.importRun && request.importRun.dataType,
            tenant: failure.tenant || (request.importRun && request.importRun.tenant),
            owningModule: failure.owningModule,
            targetModule: failure.targetModule,
            headerName: failure.headerName,
            fileName: failure.fileName,
            recordKey: failure.recordKey,
            schemaName: failure.schemaName,
            indexName: failure.indexName,
            operation: failure.operation
        };
        Object.keys(context).forEach(key => {
            if (context[key] === undefined || context[key] === null || context[key] === '') {
                delete context[key];
            }
        });
        return context;
    },

    enrichFailureError: function (request, failure) {
        if (failure.error) {
            let context = this.buildFailureContext(request, failure);
            if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError && CLASSES.NodicsError.enrich) {
                failure.error = CLASSES.NodicsError.enrich(failure.error, context);
            } else if (failure.error.addContext && typeof failure.error.addContext === 'function') {
                failure.error.addContext(context);
            }
        }
    },

    normalizeFailure: function (request, failure) {
        this.enrichFailureError(request, failure);
        let normalized = Object.assign({}, failure);
        normalized.error = this.normalizeError(failure.error);
        return normalized;
    }
};
