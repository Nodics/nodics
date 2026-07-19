/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner backoffice
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    SUC_BOF_00000: { code: '200', message: 'Module instance lease registered' },
    SUC_BOF_00001: { code: '200', message: 'Module instance lease removed' },
    SUC_BOF_00002: { code: '200', message: 'Active module registry returned' },
    SUC_BOF_00003: { code: '200', message: 'Registry diagnostics returned' },
    SUC_BOF_00004: { code: '200', message: 'Authorized BackOffice bootstrap returned' },
    SUC_BOF_00005: { code: '200', message: 'Active BackOffice contract snapshot returned' },
    SUC_BOF_00006: { code: '200', message: 'BackOffice contract history returned' },
    SUC_BOF_00007: { code: '200', message: 'BackOffice contract comparison returned' },
    SUC_BOF_00008: { code: '200', message: 'BackOffice contract candidate approved' },
    SUC_BOF_00009: { code: '200', message: 'BackOffice contract candidate rejected' },
    SUC_BOF_00010: { code: '200', message: 'BackOffice contract rollback activated' },
    SUC_BOF_00011: { code: '200', message: 'Administrative registry inventory returned' },
    SUC_BOF_00012: { code: '200', message: 'Administrative module detail returned' },
    SUC_BOF_00013: { code: '202', message: 'Module observation refresh completed' },
    ERR_BOF_00000: { code: '400', message: 'Invalid module registration' }
};
