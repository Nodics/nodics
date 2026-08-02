/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcms/data/init/data/pages/defaultCmsPageWorkflowChannelData
 * @description Seed workflow channel data routing successful CMS page approval flow execution.
 * @layer data
 * @owner wcms
 * @override Project modules may contribute additional page workflow channels through later initializer data.
 */
module.exports = {

    record0: {
        code: "reviewCmsPageChannel",
        name: "reviewCmsPageChannel",
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'reviewCmsPageAction'
    },
    record1: {
        code: 'publishCmsPageChannel',
        name: 'publishCmsPageChannel',
        active: true,
        qualifier: { decision: 'SUCCESS' },
        target: 'publishCmsPageAction'
    }
};
