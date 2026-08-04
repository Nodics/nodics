/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyApi/controller/DefaultNotifyController @description Adapts secured HTTP requests to the notification facade. @layer controller @owner notifyApi */
module.exports = { invoke: function (operation, request, callback) { let promise = FACADE.DefaultNotifyFacade[operation](request); if (callback) promise.then(value => callback(null, value)).catch(callback); else return promise; }, send: function (request, callback) { return this.invoke('send', request, callback); }, testSend: function (request, callback) { return this.invoke('testSend', request, callback); }, manageProviderAccount: function (request, callback) { return this.invoke('manageProviderAccount', request, callback); }, diagnostics: function (request, callback) { return this.invoke('diagnostics', request, callback); }, retry: function (request, callback) { return this.invoke('retry', request, callback); }, preview: function (request, callback) { return this.invoke('preview', request, callback); }, publish: function (request, callback) { return this.invoke('publish', request, callback); }, retire: function (request, callback) { return this.invoke('retire', request, callback); }, rollback: function (request, callback) { return this.invoke('rollback', request, callback); }, inbox: function (request, callback) { return this.invoke('inbox', request, callback); }, acknowledge: function (request, callback) { return this.invoke('acknowledge', request, callback); }, createVerification: function (request, callback) { return this.invoke('createVerification', request, callback); }, validateVerification: function (request, callback) { return this.invoke('validateVerification', request, callback); } };
