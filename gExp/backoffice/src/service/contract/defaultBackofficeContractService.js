/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const contracts = require('../../schemas/apiContracts');

/**
 * @module backoffice/service/contract/DefaultBackofficeContractService
 * @description Validates BackOffice registration and module-owned catalogue metadata against the authoritative API contracts.
 * @layer service
 * @owner backoffice
 * @override Later modules may extend validation while preserving bounds, field allowlists, and error behavior.
 */
module.exports = {
    /** Initializes the API contract service. */
    init: function () { return Promise.resolve(true); },
    /** Completes the API contract service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the authoritative BackOffice API contract definitions. */
    getContracts: function () { return contracts; },
    /** Returns whether a value is a non-empty bounded string. */
    isString: function (value, maxLength = 256) { return typeof value === 'string' && value.length > 0 && value.length <= maxLength; },
    /** Returns whether a list contains unique bounded strings. */
    isStringList: function (value, maxItems = 128) {
        return Array.isArray(value) && value.length <= maxItems && value.every(item => this.isString(item, 256)) && new Set(value).size === value.length;
    },
    /** Validates optional module-owned BackOffice catalogue metadata. */
    validateBackofficeMetadata: function (metadata) {
        if (metadata === undefined) return true;
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return false;
        let allowed = ['enabled', 'capabilityId', 'displayName', 'category', 'icon', 'contractVersion',
            'minimumClientContractVersion', 'requiredPermissions', 'navigation'];
        if (Object.keys(metadata).some(key => !allowed.includes(key))) return false;
        if (metadata.enabled !== undefined && typeof metadata.enabled !== 'boolean') return false;
        if (['capabilityId', 'displayName', 'category', 'icon'].some(key => metadata[key] !== undefined && !this.isString(metadata[key]))) return false;
        if (['contractVersion', 'minimumClientContractVersion'].some(key => metadata[key] !== undefined &&
            (!Number.isInteger(metadata[key]) || metadata[key] < 1))) return false;
        if (metadata.requiredPermissions !== undefined && !this.isStringList(metadata.requiredPermissions)) return false;
        if (metadata.contractVersion !== undefined && metadata.minimumClientContractVersion !== undefined &&
            metadata.minimumClientContractVersion > metadata.contractVersion) return false;
        return metadata.navigation === undefined || Array.isArray(metadata.navigation) && metadata.navigation.length <= 64 &&
            metadata.navigation.every(item => item && !Object.keys(item).some(key =>
                !['id', 'label', 'route', 'order', 'requiredPermissions'].includes(key)) && this.isString(item.id) && this.isString(item.label) &&
                (item.route === undefined || this.isString(item.route)) && (item.order === undefined || Number.isInteger(item.order)) &&
                (item.requiredPermissions === undefined || this.isStringList(item.requiredPermissions)));
    },
    /** Validates one module registration against the bounded API contract. */
    validateRegistration: function (registration) {
        if (!registration || typeof registration !== 'object' || Array.isArray(registration)) return false;
        let allowed = ['moduleName', 'instanceId', 'version', 'moduleKind', 'capabilities', 'clientCallable', 'endpoint',
            'healthPath', 'leaseTtlMs', 'runtime', 'backoffice'];
        return !Object.keys(registration).some(key => !allowed.includes(key)) &&
            contracts.moduleName.pattern && new RegExp(contracts.moduleName.pattern).test(registration.moduleName || '') &&
            this.isString(registration.instanceId, 512) && typeof registration.clientCallable === 'boolean' &&
            (registration.capabilities === undefined || this.isStringList(registration.capabilities, 256)) &&
            (registration.leaseTtlMs === undefined || Number.isInteger(registration.leaseTtlMs) && registration.leaseTtlMs >= 1000) &&
            (registration.runtime === undefined || registration.runtime && typeof registration.runtime === 'object' &&
                !Object.keys(registration.runtime).some(key => !['router', 'publish', 'web'].includes(key)) &&
                Object.keys(registration.runtime).every(key => typeof registration.runtime[key] === 'boolean')) &&
            this.validateBackofficeMetadata(registration.backoffice);
    },
    /** Validates one bounded runtime registration batch and its stable instance identity. */
    validateRegistrationBatch: function (batch, limit) {
        if (!batch || !this.isString(batch.instanceId, 512) || !Array.isArray(batch.registrations) ||
            batch.registrations.length === 0 || batch.registrations.length > Number(limit || 512)) return false;
        let allowed = ['instanceId', 'environment', 'server', 'node', 'registrations'];
        let moduleNames = batch.registrations.map(registration => registration.moduleName);
        return !Object.keys(batch).some(key => !allowed.includes(key)) &&
            (batch.environment === undefined || this.isString(batch.environment)) &&
            (batch.server === undefined || this.isString(batch.server)) &&
            (batch.node === undefined || batch.node === null || this.isString(batch.node)) &&
            new Set(moduleNames).size === moduleNames.length && batch.registrations.every(registration =>
                registration.instanceId === batch.instanceId && this.validateRegistration(registration));
    }
};
