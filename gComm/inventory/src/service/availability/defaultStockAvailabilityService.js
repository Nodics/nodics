/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/availability/DefaultStockAvailabilityService
 * @description Resolves sourcing Pools into active Warehouses and aggregates exact Stock Balance quantities as read-only ON_HAND evidence.
 * @layer service
 * @owner inventory
 * @override Projects may replace ranking or evidence projection while preserving sourcing authority, exact Units conversion, and no reservation claims.
 */
module.exports = {
    /** Initializes ON_HAND availability. */ init: function () { return Promise.resolve(true); },
    /** Completes availability initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective Availability policy. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockAvailability) || {}; },
    /** Extracts generated-service result items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Returns true when an active membership is effective at the evaluation instant. */
    effective: function (record, timestamp) {
        let from = record.effectiveFrom && new Date(record.effectiveFrom).getTime(); let to = record.effectiveTo && new Date(record.effectiveTo).getTime();
        return record.status === 'ACTIVE' && (!from || from <= timestamp) && (!to || to >= timestamp);
    },
    /** Aggregates one exact ON_HAND request with Warehouse and Balance evidence. */
    evaluate: async function (request) {
        request = request || {}; let item = request.item || {}; let policy = this.policy();
        let enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        ['itemType', 'itemCode', 'unitCode'].forEach(field => SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(item[field], 'Availability ' + field));
        let scale = Number(item.targetScale === undefined ? policy.defaultScale || 6 : item.targetScale);
        if (!Number.isInteger(scale) || scale < 0 || scale > 18) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00029', 'Availability target scale is invalid');
        let timestamp = request.at ? new Date(request.at).getTime() : Date.now();
        if (!Number.isFinite(timestamp)) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00029', 'Availability evaluation time is invalid');
        let context = Object.assign({}, request.context || {}, { itemType: item.itemType, itemCode: item.itemCode });
        let sourcing = await SERVICE.DefaultStockSourcingCacheService.evaluate({ tenant: request.tenant, authData: request.authData, context: context, at: request.at });
        let poolsResponse = sourcing.poolCodes.length ? await SERVICE.DefaultStockPoolService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, poolCode: { $in: sourcing.poolCodes }, status: 'ACTIVE' } }) : { result: [] };
        let activePoolCodes = new Set(this.items(poolsResponse).filter(pool => this.effective(pool, timestamp)).map(pool => pool.poolCode));
        let poolCodes = sourcing.poolCodes.filter(code => activePoolCodes.has(code));
        if (!poolCodes.length) return { enterpriseCode: enterpriseCode, type: 'ON_HAND', item: item,
            quantity: SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'), unitCode: item.unitCode,
            onHandQuantity: SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'),
            reservedQuantity: SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'),
            availableToSell: SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'),
            poolCodes: [], warehouseCodes: [], evidence: [], evaluatedAt: new Date(timestamp).toISOString() };
        let membersResponse = await SERVICE.DefaultStockPoolMemberService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, poolCode: { $in: poolCodes }, status: 'ACTIVE' } });
        let order = new Map(poolCodes.map((code, index) => [code, index]));
        let members = this.items(membersResponse).filter(member => this.effective(member, timestamp)).sort((a, b) =>
            order.get(a.poolCode) - order.get(b.poolCode) || a.priority - b.priority || String(a.code).localeCompare(String(b.code)));
        let memberWarehouseCodes = Array.from(new Set(members.map(member => member.warehouseCode)));
        let warehousesResponse = memberWarehouseCodes.length ? await SERVICE.DefaultWarehouseService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, warehouseCode: { $in: memberWarehouseCodes }, status: 'ACTIVE' },
            searchOptions: { limit: Number(policy.maximumWarehouses || 500) + 1 } }) : { result: [] };
        let activeWarehouseCodes = new Set(this.items(warehousesResponse).filter(warehouse => this.effective(warehouse, timestamp)).map(warehouse => warehouse.warehouseCode));
        let warehouseCodes = memberWarehouseCodes.filter(code => activeWarehouseCodes.has(code));
        if (warehouseCodes.length > Number(policy.maximumWarehouses || 500)) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00030', 'Availability Warehouse boundary exceeded');
        if (!warehouseCodes.length) return { enterpriseCode: enterpriseCode, type: 'ON_HAND', item: item,
            quantity: SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'), unitCode: item.unitCode,
            onHandQuantity: SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'),
            reservedQuantity: SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'),
            availableToSell: SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'),
            poolCodes: poolCodes, warehouseCodes: [], evidence: [], evaluatedAt: new Date(timestamp).toISOString() };
        let balancesResponse = await SERVICE.DefaultStockBalanceService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, warehouseCode: { $in: warehouseCodes }, itemType: item.itemType, itemCode: item.itemCode },
            searchOptions: { limit: Number(policy.maximumBalances || 5000) + 1 } });
        let balances = this.items(balancesResponse);
        if (balances.length > Number(policy.maximumBalances || 5000) || balances.length > Number(policy.maximumEvidence || 5000)) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00030', 'Availability Balance boundary exceeded');
        }
        let total = SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY');
        let reservedTotal = SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', scale, 'UNNECESSARY'); let evidence = [];
        for (let balance of balances) {
            let normalized = balance.quantity; let normalizedReserved = balance.reservedQuantity ||
                SERVICE.DefaultExactUnitsService.multiplyRational('0', '1', '1', Number(balance.scale), 'UNNECESSARY');
            if (balance.unitCode !== item.unitCode || Number(balance.scale) !== scale) {
                let conversion = await SERVICE.DefaultInventoryUnitsReferenceProviderService.convert(request, { quantity: balance.quantity,
                    fromUnitCode: balance.unitCode, toUnitCode: item.unitCode, targetScale: scale,
                    roundingMode: policy.roundingMode || 'UNNECESSARY', at: request.at }); normalized = conversion.quantity;
                let reservedConversion = await SERVICE.DefaultInventoryUnitsReferenceProviderService.convert(request, { quantity: normalizedReserved,
                    fromUnitCode: balance.unitCode, toUnitCode: item.unitCode, targetScale: scale,
                    roundingMode: policy.roundingMode || 'UNNECESSARY', at: request.at }); normalizedReserved = reservedConversion.quantity;
            }
            total = SERVICE.DefaultExactUnitsService.add(total, normalized, scale, policy.roundingMode || 'UNNECESSARY');
            reservedTotal = SERVICE.DefaultExactUnitsService.add(reservedTotal, normalizedReserved, scale, policy.roundingMode || 'UNNECESSARY');
            evidence.push({ stockCode: balance.code, warehouseCode: balance.warehouseCode, locationCode: balance.locationCode,
                quantity: balance.quantity, reservedQuantity: balance.reservedQuantity || normalizedReserved, unitCode: balance.unitCode,
                normalizedQuantity: normalized, normalizedReservedQuantity: normalizedReserved, revision: balance.revision });
        }
        let availableToSell = SERVICE.DefaultExactUnitsService.add(total,
            SERVICE.DefaultExactUnitsService.format(-SERVICE.DefaultExactUnitsService.parse(reservedTotal).unscaled, scale), scale, policy.roundingMode || 'UNNECESSARY');
        return { enterpriseCode: enterpriseCode, type: 'ON_HAND', item: item, quantity: total, unitCode: item.unitCode,
            onHandQuantity: total, reservedQuantity: reservedTotal, availableToSell: availableToSell,
            poolCodes: poolCodes, warehouseCodes: warehouseCodes, evidence: evidence, evaluatedAt: new Date(timestamp).toISOString() };
    }
};
