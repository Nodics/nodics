/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module units/src/interceptors/interceptors
 * @description Interceptor definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    dimensionPreSave: { type: 'schema', item: 'unitDimension', trigger: 'preSave', active: 'true', index: -100,
        handler: 'DefaultUnitsDefinitionService.prepareDimensionSave' },
    dimensionPreRemove: { type: 'schema', item: 'unitDimension', trigger: 'preRemove', active: 'true', index: -100,
        handler: 'DefaultUnitsDefinitionService.rejectHardDelete' },
    unitPreSave: { type: 'schema', item: 'unitOfMeasure', trigger: 'preSave', active: 'true', index: -100,
        handler: 'DefaultUnitsDefinitionService.prepareUnitSave' },
    unitPreRemove: { type: 'schema', item: 'unitOfMeasure', trigger: 'preRemove', active: 'true', index: -100,
        handler: 'DefaultUnitsDefinitionService.rejectHardDelete' },
    conversionPreSave: { type: 'schema', item: 'unitConversion', trigger: 'preSave', active: 'true', index: -100,
        handler: 'DefaultUnitsDefinitionService.prepareConversionSave' },
    conversionPreRemove: { type: 'schema', item: 'unitConversion', trigger: 'preRemove', active: 'true', index: -100,
        handler: 'DefaultUnitsDefinitionService.rejectHardDelete' }
};
