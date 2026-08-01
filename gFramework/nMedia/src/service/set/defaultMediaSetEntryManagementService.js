/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/service/set/defaultMediaSetEntryManagementService
 * @description Provides nMedia-owned operations for media set entry lifecycle.
 * @layer service
 * @owner nMedia
 * @override Later project/customer modules may override set-entry selection or persistence while preserving Product/CMS ownership boundaries.
 */
module.exports = {
    /** Initializes the media set entry management lifecycle. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Completes the media set entry management lifecycle after service loading. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /** Adds one entry to a media set. */
    addEntry: function (request) {
        let model = this.normalizeEntry(request || {}, true);
        this.assertMediaSetExists(model.mediaSetCode);
        let service = this.getEntryService();
        return this.saveEntry(service, model);
    },

    /** Updates one existing entry inside a media set. */
    updateEntry: function (request) {
        request = request || {};
        let mediaSetCode = this.safeCode(request.mediaSetCode, 'Media set code');
        let entryCode = this.safeCode(request.entryCode || request.code, 'Media set entry code');
        this.assertMediaSetExists(mediaSetCode);
        let existing = this.getEntry(entryCode);
        if (!existing || existing.mediaSetCode !== mediaSetCode) {
            throw new CLASSES.NodicsError('ERR_MED_00014', 'Invalid media set entry');
        }
        let model = this.normalizeEntry(Object.assign({}, existing, request, { code: entryCode, mediaSetCode: mediaSetCode }), false);
        return this.saveEntry(this.getEntryService(), model);
    },

    /** Removes one entry from a media set. */
    removeEntry: function (request) {
        request = request || {};
        let mediaSetCode = this.safeCode(request.mediaSetCode, 'Media set code');
        let entryCode = this.safeCode(request.entryCode || request.code, 'Media set entry code');
        this.assertMediaSetExists(mediaSetCode);
        let existing = this.getEntry(entryCode);
        if (!existing || existing.mediaSetCode !== mediaSetCode) {
            throw new CLASSES.NodicsError('ERR_MED_00014', 'Invalid media set entry');
        }
        let service = this.getEntryService();
        if (Array.isArray(service.records)) {
            let index = service.records.findIndex(record => record && record.code === entryCode);
            if (index >= 0) {
                service.records.splice(index, 1);
            }
        } else if (service.remove) {
            service.remove(existing);
        } else if (service.delete) {
            service.delete(existing);
        } else {
            let next = Object.assign({}, existing, { status: 'INACTIVE' });
            this.saveEntry(service, next);
            return next;
        }
        return { code: entryCode, mediaSetCode: mediaSetCode, removed: true };
    },

    /** Reorders entries by assigning positions from the supplied ordered entry codes. */
    reorderEntries: function (request) {
        request = request || {};
        let mediaSetCode = this.safeCode(request.mediaSetCode, 'Media set code');
        let entryCodes = this.normalizeCodeList(request.entryCodes || request.entries, 'Media set entry codes');
        this.assertMediaSetExists(mediaSetCode);
        let service = this.getEntryService();
        let updated = entryCodes.map((entryCode, index) => {
            let existing = this.getEntry(entryCode);
            if (!existing || existing.mediaSetCode !== mediaSetCode) {
                throw new CLASSES.NodicsError('ERR_MED_00014', 'Invalid media set entry');
            }
            return this.saveEntry(service, Object.assign({}, existing, { position: index + 1 }));
        });
        return { mediaSetCode: mediaSetCode, entries: updated };
    },

    /** Marks one entry primary and clears primary from sibling entries when they are available. */
    setPrimaryEntry: function (request) {
        request = request || {};
        let mediaSetCode = this.safeCode(request.mediaSetCode, 'Media set code');
        let entryCode = this.safeCode(request.entryCode || request.code, 'Media set entry code');
        this.assertMediaSetExists(mediaSetCode);
        let service = this.getEntryService();
        let entries = this.listEntries(mediaSetCode);
        let target = entries.find(entry => entry.code === entryCode) || this.getEntry(entryCode);
        if (!target || target.mediaSetCode !== mediaSetCode) {
            throw new CLASSES.NodicsError('ERR_MED_00014', 'Invalid media set entry');
        }
        entries.forEach(entry => {
            if (entry.code !== entryCode && entry.primary === true) {
                this.saveEntry(service, Object.assign({}, entry, { primary: false }));
            }
        });
        return this.saveEntry(service, Object.assign({}, target, { primary: true, status: target.status || 'ACTIVE' }));
    },

    /** @returns {Object} Generated media set entry persistence service. */
    getEntryService: function () {
        if (!SERVICE || !SERVICE.DefaultMediaSetEntryService) {
            throw new CLASSES.NodicsError('ERR_MED_00015', 'Media set entry service is unavailable');
        }
        return SERVICE.DefaultMediaSetEntryService;
    },

    /** @returns {Object|undefined} Generated media set persistence service. */
    getSetService: function () {
        return SERVICE && SERVICE.DefaultMediaSetService;
    },

    /** Ensures the owning media set exists when the generated service is available. */
    assertMediaSetExists: function (mediaSetCode) {
        let service = this.getSetService();
        if (!service) {
            return true;
        }
        let mediaSet = this.invokeRead(service, mediaSetCode);
        if (!mediaSet) {
            throw new CLASSES.NodicsError('ERR_MED_00016', 'Invalid media set');
        }
        return true;
    },

    /** Reads one entry by code from the generated service when possible. */
    getEntry: function (entryCode) {
        return this.invokeRead(this.getEntryService(), entryCode);
    },

    /** Lists entries for one media set when the generated service exposes a list/search helper. */
    listEntries: function (mediaSetCode) {
        let service = this.getEntryService();
        let entries = [];
        if (service.listByMediaSetCode) {
            entries = service.listByMediaSetCode(mediaSetCode) || [];
        } else if (service.search) {
            entries = service.search({ mediaSetCode: mediaSetCode }) || [];
        } else if (service.list) {
            entries = service.list() || [];
        } else if (Array.isArray(service.records)) {
            entries = service.records;
        }
        return entries.filter(entry => entry && entry.mediaSetCode === mediaSetCode);
    },

    /** Invokes a generated-service read helper using common Nodics/service shapes. */
    invokeRead: function (service, code) {
        if (!service) {
            return undefined;
        }
        if (service.get) {
            return service.get(code);
        }
        if (service.getByCode) {
            return service.getByCode(code);
        }
        if (service.findByCode) {
            return service.findByCode(code);
        }
        if (service.records && Array.isArray(service.records)) {
            return service.records.find(record => record && record.code === code);
        }
        return undefined;
    },

    /** Saves an entry using generated persistence service conventions. */
    saveEntry: function (service, model) {
        if (service.save) {
            return service.save(model);
        }
        if (service.update) {
            return service.update(model);
        }
        if (Array.isArray(service.records)) {
            let index = service.records.findIndex(record => record && record.code === model.code);
            if (index >= 0) {
                service.records[index] = model;
            } else {
                service.records.push(model);
            }
            return model;
        }
        throw new CLASSES.NodicsError('ERR_MED_00015', 'Media set entry service is unavailable');
    },

    /** Normalizes one entry request. */
    normalizeEntry: function (request, creating) {
        let code = this.safeCode(request.code || request.entryCode, 'Media set entry code');
        let mediaSetCode = this.safeCode(request.mediaSetCode, 'Media set code');
        let mediaCode = this.safeCode(request.mediaCode, 'Media code');
        let status = request.status || 'ACTIVE';
        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            throw new CLASSES.NodicsError('ERR_MED_00017', 'Invalid media set entry status');
        }
        if (creating && this.getEntry(code)) {
            throw new CLASSES.NodicsError('ERR_MED_00018', 'Media set entry already exists');
        }
        return {
            code: code,
            mediaSetCode: mediaSetCode,
            mediaCode: mediaCode,
            formatCode: this.safeOptionalCode(request.formatCode, 'Format code'),
            variantRole: this.safeOptionalText(request.variantRole),
            localeCode: this.safeOptionalCode(request.localeCode, 'Locale code'),
            channelCode: this.safeOptionalCode(request.channelCode, 'Channel code'),
            deviceCode: this.safeOptionalCode(request.deviceCode, 'Device code'),
            breakpointCode: this.safeOptionalCode(request.breakpointCode, 'Breakpoint code'),
            fallbackEntryCode: this.safeOptionalCode(request.fallbackEntryCode, 'Fallback entry code'),
            width: this.normalizeNonNegativeOptionalInteger(request.width, 'width'),
            height: this.normalizeNonNegativeOptionalInteger(request.height, 'height'),
            position: this.normalizeNonNegativeOptionalInteger(request.position, 'position'),
            primary: request.primary === true,
            status: status
        };
    },

    /** Validates an identifier. */
    safeCode: function (value, label) {
        if (typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(value)) {
            throw new CLASSES.NodicsError('ERR_MED_00017', label + ' is invalid');
        }
        return value;
    },

    /** Validates an optional identifier. */
    safeOptionalCode: function (value, label) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        return this.safeCode(value, label);
    },

    /** Validates optional text. */
    safeOptionalText: function (value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        if (typeof value !== 'string' || value.length > 500) {
            throw new CLASSES.NodicsError('ERR_MED_00017', 'Invalid media set entry text');
        }
        return value.trim() || undefined;
    },

    /** Normalizes optional non-negative integers. */
    normalizeNonNegativeOptionalInteger: function (value, label) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        let number = Number(value);
        if (!Number.isSafeInteger(number) || number < 0) {
            throw new CLASSES.NodicsError('ERR_MED_00017', 'Invalid media set entry ' + label);
        }
        return number;
    },

    /** Normalizes an ordered list of entry codes. */
    normalizeCodeList: function (values, label) {
        if (!Array.isArray(values) || !values.length) {
            throw new CLASSES.NodicsError('ERR_MED_00017', label + ' are required');
        }
        return values.map(value => typeof value === 'string' ? value : value && value.code).map(value => this.safeCode(value, label.slice(0, -1)));
    }
};
