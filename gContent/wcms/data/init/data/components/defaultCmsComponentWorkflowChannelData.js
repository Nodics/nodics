/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module wcms/data/init/data/components/defaultCmsComponentWorkflowChannelData
 * @description Seed workflow channel data routing successful CMS component approval flow execution.
 * @layer data
 * @owner wcms
 * @override Project modules may contribute additional component workflow channels through later initializer data.
 */
module.exports = {

    record0: {
        code: "reviewCmsComponentChannel",
        name: "reviewCmsComponentChannel",
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'reviewCmsComponentAction'
    }
};
