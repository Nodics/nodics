/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/statusDefinitions @description Stable Product operation and error mappings. @layer utility @owner product */
module.exports = {
    SUC_PRODUCT_00001: { code: '200', message: 'Product operation completed' },
    ERR_PRODUCT_00001: { code: '401', message: 'Enterprise context required' },
    ERR_PRODUCT_00002: { code: '403', message: 'Enterprise scope mismatch' },
    ERR_PRODUCT_00003: { code: '400', message: 'Product identity invalid' },
    ERR_PRODUCT_00004: { code: '409', message: 'Derived Product identity conflict' },
    ERR_PRODUCT_00010: { code: '400', message: 'Product item policy invalid' },
    ERR_PRODUCT_00011: { code: '409', message: 'Product identity, lifecycle, or history operation invalid' },
    ERR_PRODUCT_00012: { code: '404', message: 'Product target not found uniquely' },
    ERR_PRODUCT_00013: { code: '400', message: 'Product identifier invalid' },
    ERR_PRODUCT_00014: { code: '400', message: 'Product Category invalid' },
    ERR_PRODUCT_00015: { code: '409', message: 'Product Category hierarchy invalid' },
    ERR_PRODUCT_00016: { code: '409', message: 'Product Category has active dependants' },
    ERR_PRODUCT_00017: { code: '400', message: 'Product Category assignment invalid' },
    ERR_PRODUCT_00018: { code: '400', message: 'Product attribute definition invalid' },
    ERR_PRODUCT_00019: { code: '400', message: 'Product attribute value invalid' },
    ERR_PRODUCT_00020: { code: '503', message: 'Product reference provider unavailable' },
    ERR_PRODUCT_00021: { code: '400', message: 'Product reference invalid' },
    ERR_PRODUCT_00022: { code: '403', message: 'Human Product administrator required' },
    ERR_PRODUCT_00023: { code: '400', message: 'Product management request invalid' },
    ERR_PRODUCT_00024: { code: '413', message: 'Product management boundary exceeded' },
    ERR_PRODUCT_00025: { code: '409', message: 'Product attribute cardinality invalid' },
    ERR_PRODUCT_00026: { code: '400', message: 'Product classification invalid' },
    ERR_PRODUCT_00027: { code: '409', message: 'Product classification dependencies remain active' },
    ERR_PRODUCT_00028: { code: '400', message: 'Product variant axis invalid' },
    ERR_PRODUCT_00029: { code: '409', message: 'Product variant graph or combination invalid' },
    ERR_PRODUCT_00030: { code: '403', message: 'Product reference lookup requires service identity' },
    ERR_PRODUCT_00031: { code: '400', message: 'Product reference lookup request invalid' }
    ,ERR_PRODUCT_00032: { code: '400', message: 'Product relation invalid' }
    ,ERR_PRODUCT_00033: { code: '409', message: 'Product relation graph or duplicate invalid' }
    ,ERR_PRODUCT_00034: { code: '400', message: 'Product bundle entry invalid' }
    ,ERR_PRODUCT_00035: { code: '409', message: 'Product bundle graph or duplicate invalid' }
    ,ERR_PRODUCT_00036: { code: '400', message: 'Product packaging invalid' }
    ,ERR_PRODUCT_00037: { code: '400', message: 'Product media reference invalid' }
    ,ERR_PRODUCT_00040: { code: '404', message: 'Product publication source version unavailable' }
    ,ERR_PRODUCT_00041: { code: '413', message: 'Product publication graph exceeds bounds' }
    ,ERR_PRODUCT_00042: { code: '409', message: 'Product publication requires Staged runtime' }
    ,ERR_PRODUCT_00043: { code: '503', message: 'Product Online transport unavailable' }
    ,ERR_PRODUCT_00044: { code: '409', message: 'Previous Product Online release unavailable' }
    ,ERR_PRODUCT_00045: { code: '500', message: 'Product publication schema service unavailable' }
    ,ERR_PRODUCT_00046: { code: '409', message: 'Frozen Product dependency unavailable' }
    ,ERR_PRODUCT_00047: { code: '409', message: 'Product manifest identity conflict' }
    ,ERR_PRODUCT_00048: { code: '400', message: 'Product manifest integrity invalid' }
    ,ERR_PRODUCT_00049: { code: '503', message: 'Product internal publication token unavailable' }
    ,ERR_PRODUCT_00050: { code: '409', message: 'Product target requires Online runtime' }
    ,ERR_PRODUCT_00051: { code: '409', message: 'Product Online pointer revision conflict' }
    ,ERR_PRODUCT_00052: { code: '413', message: 'Product manifest exceeds target bounds' }
    ,ERR_PRODUCT_00053: { code: '400', message: 'Product publication contract unsupported' }
    ,ERR_PRODUCT_00054: { code: '404', message: 'Product rollback manifest unavailable' }
    ,ERR_PRODUCT_00055: { code: '400', message: 'Product publication Workflow request invalid' }
    ,ERR_PRODUCT_00056: { code: '503', message: 'Product publication Workflow unavailable' }
    ,ERR_PRODUCT_00060: { code: '400', message: 'Product Online delivery request invalid' }
    ,ERR_PRODUCT_00061: { code: '404', message: 'Product active Online release unavailable' }
    ,ERR_PRODUCT_00062: { code: '403', message: 'Product Online release scope invalid' }
    ,ERR_PRODUCT_00063: { code: '413', message: 'Product Online expansion exceeds bounds' }
    ,ERR_PRODUCT_00064: { code: '400', message: 'Product delivery cache policy invalid' }
    ,ERR_PRODUCT_00065: { code: '503', message: 'Product projection manifest unavailable' }
    ,ERR_PRODUCT_00066: { code: '503', message: 'Product search projection failed' }
    ,ERR_PRODUCT_00067: { code: '401', message: 'Active Storefront context is required' }
};
