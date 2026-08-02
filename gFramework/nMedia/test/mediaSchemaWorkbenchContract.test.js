/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaSchemaWorkbenchContract
 * @description Validates that nMedia exposes safe Schema Workbench search and
 * filtering metadata without returning raw storage locator fields.
 * @layer test
 * @owner nMedia
 * @override Later media schema extensions may add safe fields, but must not
 * expose provider storage internals through BackOffice Workbench records.
 */

const assert = require('assert');
const schemas = require('../src/schemas/schemas');

const mediaModule = {
    rawSchema: schemas.media,
};

global.NODICS = {
    getModule: (name) => (name === 'media' ? mediaModule : undefined),
};
global.CONFIG = {
    get: (key) => {
        if (key === 'accessPoints') {
            return {
                readAccessPoint: 1,
                writeAccessPoint: 2,
                removeAccessPoint: 3,
            };
        }
        if (key === 'schemaWorkbench') {
            return {
                discoverModelsByDefault: true,
                defaultModelOperations: ['search', 'read', 'create', 'update', 'delete'],
                defaultRelationshipActions: ['SELECT_EXISTING', 'CREATE_RELATED'],
                defaultMutationMode: 'GENERATED_CRUD',
                defaultPageSize: 25,
                allowedPageSizes: [10, 25, 50],
                maximumPageSize: 50,
                maximumSearchLength: 100,
                maximumFilterConditions: 20,
                maximumFilterDepth: 3,
            };
        }
        return undefined;
    },
};
let lastMediaSearchInput;
global.SERVICE = {
    DefaultSchemaAccessHandlerService: {
        getAccessPoint: () => 10,
    },
    DefaultMediaService: {
        get: (input) => {
            lastMediaSearchInput = input;
            assert.strictEqual(input.searchOptions.projection.storageKey, undefined);
            assert.strictEqual(input.searchOptions.projection.relativePath, undefined);
            assert.strictEqual(input.searchOptions.projection.fullPath, undefined);
            assert.strictEqual(input.searchOptions.projection.url, undefined);
            assert.strictEqual(input.searchOptions.projection.accessUrl, undefined);
            return Promise.resolve({
                count: 1,
                result: [
                    {
                        code: 'home-banner',
                        originalFileName: 'home-banner.png',
                        folderCode: 'cmsAssets',
                        formatCode: 'desktop',
                        access: 'PUBLIC',
                        status: 'READY',
                    },
                ],
            });
        },
    },
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message);
            this.code = code;
        }
    },
};

const service = require('../../nDatabase/database/src/service/schema/defaultSchemaWorkbenchService');

(async function () {
    let request = {
        moduleName: 'media',
        tenant: 'default',
        authData: { userGroups: ['adminGroup'] },
        httpRequest: { params: { schema: 'media' } },
    };
    let descriptor = (await service.get(request)).data;
    assert(!descriptor.fields.some((field) => field.name === 'storageKey'), 'media Workbench descriptor must not expose storageKey');
    assert(!descriptor.fields.some((field) => field.name === 'fullPath'), 'media Workbench descriptor must not expose fullPath');
    assert(descriptor.queryCapabilities.searchableFields.includes('originalFileName'), 'media Workbench search must include originalFileName');
    assert(descriptor.queryCapabilities.searchableFields.includes('folderCode'), 'media Workbench search must include folderCode');
    assert(
        descriptor.queryCapabilities.filterFields.some((field) => field.field === 'folderCode' && field.operators.includes('EQUALS')),
        'media Workbench must allow folderCode filtering',
    );
    assert(
        descriptor.queryCapabilities.filterFields.some((field) => field.field === 'access' && field.operators.includes('IN')),
        'media Workbench must allow access enum filtering',
    );
    let searched = await service.search(
        Object.assign({}, request, {
            httpRequest: {
                params: { schema: 'media' },
                body: {
                    search: 'banner',
                    pageNumber: 1,
                    pageSize: 10,
                    sort: { field: 'code', direction: 'ASC' },
                    filters: {
                        operator: 'AND',
                        items: [
                            {
                                field: 'folderCode',
                                operator: 'EQUALS',
                                value: 'cmsAssets',
                            },
                            {
                                field: 'access',
                                operator: 'IN',
                                value: ['PUBLIC'],
                            },
                        ],
                    },
                },
            },
        }),
    );
    assert.strictEqual(searched.data.totalCount, 1);
    assert.deepStrictEqual(searched.data.records[0], {
        code: 'home-banner',
        originalFileName: 'home-banner.png',
        folderCode: 'cmsAssets',
        formatCode: 'desktop',
        access: 'PUBLIC',
        status: 'READY',
    });
    assert.deepStrictEqual(lastMediaSearchInput.searchOptions.projection, {
        _id: 0,
        code: 1,
        name: 1,
        description: 1,
        folderCode: 1,
        formatCode: 1,
        providerCode: 1,
        originalFileName: 1,
        mimeType: 1,
        extension: 1,
        sizeBytes: 1,
        checksum: 1,
        checksumAlgorithm: 1,
        access: 1,
        status: 1,
    });
    console.log('nMedia Schema Workbench contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
