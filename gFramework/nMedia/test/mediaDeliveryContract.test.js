/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/test/mediaDeliveryContract
 * @description Validates media-code based content delivery access policy.
 * @layer test
 * @owner nMedia
 * @override Delivery extensions must preserve nMedia-owned access validation
 * and must not expose provider paths as caller authority.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const properties = require('../config/properties');
const policyService = require('../src/service/storage/defaultMediaStoragePolicyService');
const keyService = require('../src/service/storage/defaultMediaStorageKeyService');
const rootResolverService = require('../src/service/storage/defaultMediaStorageRootResolverService');
const registryService = require('../src/service/storage/defaultMediaStorageProviderRegistryService');
const localProviderService = require('../src/service/storage/provider/defaultLocalMediaStorageProviderService');
const deliveryService = require('../src/service/storage/defaultMediaDeliveryService');
const contentResponseHandler = require('../src/service/storage/defaultMediaContentResponseHandlerService');

class NodicsError extends Error {
    constructor(code, message) {
        super(message || code);
        this.code = code;
    }
}

(async function () {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-media-delivery-contract-'));
    const serverPath = path.join(workspace, 'startio/envs/startioLocal/monoServer');
    const mediaPath = path.join(serverPath, 'temp/media/media/content/default/default/cmsComponent/2026/07/home-banner.png');
    fs.mkdirSync(path.dirname(mediaPath), { recursive: true });
    fs.writeFileSync(mediaPath, Buffer.from('png'));

    const mediaRows = [
        {
            code: 'home-banner',
            folderCode: 'cmsAssets',
            formatCode: 'original',
            providerCode: 'local',
            storageKey: 'media/content/default/default/cmsComponent/2026/07/home-banner.png',
            originalFileName: 'home-banner.png',
            storedFileName: 'home-banner.png',
            mimeType: 'image/png',
            extension: 'png',
            sizeBytes: 3,
            access: 'PUBLIC',
            status: 'READY'
        },
        {
            code: 'kyc-doc',
            folderCode: 'default',
            formatCode: 'original',
            providerCode: 'local',
            storageKey: 'media/utility/default/default/customerDocument/2026/07/kyc-doc.pdf',
            originalFileName: 'kyc.pdf',
            storedFileName: 'kyc.pdf',
            mimeType: 'application/pdf',
            extension: 'pdf',
            access: 'PRIVATE',
            status: 'READY'
        }
    ];
    const privatePath = path.join(serverPath, 'temp/media/media/utility/default/default/customerDocument/2026/07/kyc-doc.pdf');
    fs.mkdirSync(path.dirname(privatePath), { recursive: true });
    fs.writeFileSync(privatePath, Buffer.from('pdf'));

    global.CLASSES = { NodicsError };
    global.NODICS = {
        getServerPath: function () {
            return serverPath;
        }
    };
    global.CONFIG = {
        get: function (key) {
            return properties[key];
        }
    };
    global.SERVICE = {
        DefaultMediaStoragePolicyService: policyService,
        DefaultMediaStorageKeyService: keyService,
        DefaultMediaStorageRootResolverService: rootResolverService,
        DefaultMediaStorageProviderRegistryService: registryService,
        DefaultLocalMediaStorageProviderService: localProviderService,
        DefaultMediaService: {
            get: async function (request) {
                return { result: mediaRows.filter(row => row.code === request.query.code && request.query.status.$in.includes(row.status)) };
            }
        }
    };

    const publicDelivery = await deliveryService.deliver({ params: { mediaCode: 'home-banner' } });
    assert.strictEqual(publicDelivery.mediaCode, 'home-banner');
    assert.strictEqual(publicDelivery.filePath, mediaPath);
    assert.strictEqual(publicDelivery.mimeType, 'image/png');
    assert.strictEqual(publicDelivery.contentDisposition, 'inline');

    const originalDeliveryEnabled = properties.media.delivery.enabled;
    properties.media.delivery.enabled = false;
    await assert.rejects(
        () => deliveryService.deliver({ params: { mediaCode: 'home-banner' } }),
        error => error.code === 'ERR_MED_00012' && /disabled/.test(error.message)
    );
    properties.media.delivery.enabled = originalDeliveryEnabled;

    await assert.rejects(
        () => deliveryService.deliver({ params: { mediaCode: 'kyc-doc' } }),
        error => error.code === 'ERR_MED_00012' && /authenticated/.test(error.message)
    );
    const privateDelivery = await deliveryService.deliver({
        authData: { loginId: 'admin', userGroups: ['adminGroup'] },
        params: { mediaCode: 'kyc-doc' },
        download: true
    });
    assert.strictEqual(privateDelivery.mediaCode, 'kyc-doc');
    assert.strictEqual(privateDelivery.filePath, privatePath);
    assert.strictEqual(privateDelivery.contentDisposition, 'attachment');
    await assert.rejects(
        () => deliveryService.deliver({ params: { mediaCode: '../escape' } }),
        error => error.code === 'ERR_MED_00012'
    );

    const circularError = new NodicsError('ERR_MED_00012', 'Private media delivery requires an authenticated principal');
    circularError.responseCode = '401';
    circularError.defaultCode = 'ERR_SYS_00000';
    circularError.errors = [circularError];
    let jsonPayload;
    let httpStatus;
    contentResponseHandler.handleError({}, {
        status: function (status) {
            httpStatus = status;
            return this;
        },
        json: function (payload) {
            JSON.stringify(payload);
            jsonPayload = payload;
        }
    }, circularError);
    assert.strictEqual(httpStatus, 401);
    assert.strictEqual(jsonPayload.code, 'ERR_MED_00012');
    assert.strictEqual(jsonPayload.message, 'Private media delivery requires an authenticated principal');
    assert.strictEqual(jsonPayload.errors, undefined);

    let downloadedPath;
    let downloadedName;
    contentResponseHandler.handleSuccess({}, {
        type: function () { },
        set: function () { },
        download: function (filePath, fileName, callback) {
            downloadedPath = filePath;
            downloadedName = fileName;
            assert.strictEqual(typeof callback, 'function');
            callback();
        }
    }, privateDelivery);
    assert.strictEqual(downloadedPath, privatePath);
    assert.strictEqual(downloadedName, 'kyc.pdf');

    let sentFilePath;
    contentResponseHandler.handleSuccess({}, {
        type: function () { },
        set: function () { },
        sendFile: function (filePath, callback) {
            sentFilePath = filePath;
            assert.strictEqual(typeof callback, 'function');
            callback();
        }
    }, publicDelivery);
    assert.strictEqual(sentFilePath, mediaPath);

    let transferErrorStatus;
    let transferErrorPayload;
    contentResponseHandler.handleSuccess({}, {
        type: function () { },
        set: function () { },
        headersSent: false,
        sendFile: function (filePath, callback) {
            callback(new NodicsError('ERR_MED_00012', 'Media file is not readable'));
        },
        status: function (status) {
            transferErrorStatus = status;
            return this;
        },
        json: function (payload) {
            transferErrorPayload = payload;
        }
    }, publicDelivery);
    assert.strictEqual(transferErrorStatus, 500);
    assert.strictEqual(transferErrorPayload.code, 'ERR_MED_00012');
    assert.strictEqual(transferErrorPayload.message, 'Media file is not readable');

    fs.rmSync(workspace, { recursive: true, force: true });
    console.log('nMedia delivery contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
