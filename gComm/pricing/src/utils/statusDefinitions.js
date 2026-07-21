/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/utils/statusDefinitions @description Stable Pricing error-to-HTTP mappings. @layer utility @owner pricing */
module.exports = {
    SUC_PRICE_00001: { code: '200', message: 'Pricing operation completed' },
    ERR_PRICE_00001: { code: '401', message: 'Enterprise context required' },
    ERR_PRICE_00002: { code: '403', message: 'Enterprise scope mismatch' },
    ERR_PRICE_00003: { code: '400', message: 'Pricing identity policy or code invalid' },
    ERR_PRICE_00006: { code: '409', message: 'Derived Pricing identity conflict' },
    ERR_PRICE_00010: { code: '400', message: 'Effective date range invalid' },
    ERR_PRICE_00011: { code: '400', message: 'Priority outside configured bounds' },
    ERR_PRICE_00012: { code: '400', message: 'Exact decimal value invalid' },
    ERR_PRICE_00013: { code: '400', message: 'Price List policy invalid' },
    ERR_PRICE_00014: { code: '400', message: 'Assignment scope invalid' },
    ERR_PRICE_00015: { code: '400', message: 'Price Group type invalid' },
    ERR_PRICE_00016: { code: '400', message: 'Price qualifier combination invalid' },
    ERR_PRICE_00017: { code: '400', message: 'Currency or Unit factor invalid' },
    ERR_PRICE_00018: { code: '409', message: 'Pricing identity, lifecycle, or history operation invalid' },
    ERR_PRICE_00019: { code: '404', message: 'Pricing update target not found uniquely' },
    ERR_PRICE_00020: { code: '503', message: 'Pricing reference provider unavailable' },
    ERR_PRICE_00021: { code: '400', message: 'Pricing reference invalid' },
    ERR_PRICE_00022: { code: '403', message: 'Human Pricing administrator required' },
    ERR_PRICE_00023: { code: '400', message: 'Pricing management request invalid' },
    ERR_PRICE_00024: { code: '413', message: 'Pricing management boundary exceeded' },
    ERR_PRICE_00025: { code: '409', message: 'Pricing overlap or ambiguity detected' },
    ERR_PRICE_00026: { code: '400', message: 'Pricing publication workflow request invalid' },
    ERR_PRICE_00027: { code: '503', message: 'Pricing publication workflow unavailable' },
    ERR_PRICE_00030: { code: '400', message: 'Price resolution request invalid' },
    ERR_PRICE_00031: { code: '400', message: 'Price resolution context invalid' },
    ERR_PRICE_00032: { code: '400', message: 'Price resolution time invalid' },
    ERR_PRICE_00033: { code: '404', message: 'Applicable Price List not found' },
    ERR_PRICE_00034: { code: '404', message: 'Applicable Price not found' },
    ERR_PRICE_00035: { code: '409', message: 'Ambiguous Price resolution' },
    ERR_PRICE_00040: { code: '400', message: 'Pricing cache boundary invalid' },
    ERR_PRICE_00050: { code: '404', message: 'Pricing source version not found' },
    ERR_PRICE_00051: { code: '413', message: 'Pricing publication dependency boundary exceeded' },
    ERR_PRICE_00052: { code: '409', message: 'Pricing Staged runtime role invalid' },
    ERR_PRICE_00053: { code: '503', message: 'Pricing Online target unavailable' },
    ERR_PRICE_00054: { code: '409', message: 'Pricing rollback target unavailable' },
    ERR_PRICE_00055: { code: '503', message: 'Pricing publication service unavailable' },
    ERR_PRICE_00056: { code: '404', message: 'Frozen Pricing dependency unavailable' },
    ERR_PRICE_00057: { code: '409', message: 'Pricing manifest identity conflict' },
    ERR_PRICE_00058: { code: '400', message: 'Pricing manifest integrity invalid' },
    ERR_PRICE_00059: { code: '503', message: 'Pricing publication service authentication unavailable' },
    ERR_PRICE_00060: { code: '409', message: 'Pricing Online runtime role invalid' },
    ERR_PRICE_00061: { code: '409', message: 'Pricing Online pointer revision conflict' },
    ERR_PRICE_00062: { code: '413', message: 'Pricing manifest missing or oversized' },
    ERR_PRICE_00063: { code: '400', message: 'Pricing publication contract unsupported' },
    ERR_PRICE_00064: { code: '404', message: 'Pricing Online rollback manifest unavailable' }
};
