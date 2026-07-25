/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/src/utils/contractValues
 * @description Publishes shared closed-set values used by runtime validation and API schemas.
 * @layer utility
 * @owner aiKnowledge
 * @override Later modules may narrow policy through configuration but may not silently widen these contract values.
 */
module.exports = Object.freeze({
    audiences: Object.freeze(['PUBLIC', 'CUSTOMER', 'EMPLOYEE', 'PARTNER', 'DEVELOPER']),
    classifications: Object.freeze(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
    sourceTypes: Object.freeze(['GDOCS', 'CMS', 'MODEL_PROJECTION', 'PARTNER_DOCUMENTATION']),
    retrievalModes: Object.freeze(['INDEXED', 'LIVE', 'HYBRID']),
    searchModes: Object.freeze(['LEXICAL', 'VECTOR', 'HYBRID'])
});
