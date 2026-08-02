/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/search/indexes
 * @description Documents nSearch indexes module behavior.
 * @layer search
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    profile: {

    },
    search: {
        // order: {
        //     enabled: false,
        //     idPropertyName: 'code',
        //     preProcessor: 'DefaultEnterpriseIndexProcessorService.preEnterpriseIndexProcessor', // Will get executed just after data fetch from DB
        //     postProcessor: 'DefaultEnterpriseIndexProcessorService.postEnterpriseIndexProcessor', // will get executed once every data got collected and processed
        //     properties: {
        //         desc: {
        //             valueProvider: 'DefaultEnterpriseDescProviderService.getEnterpriseDescription'
        //         },
        //         custom: {
        //             enabled: true,
        //             valueProvider: 'DefaultEnterpriseDescProviderService.getEnterpriseCustom'
        //         }
        //     }
        // },

        // catalog: {
        //     enabled: false,
        //     idPropertyName: 'code',
        //     preProcessor: 'DefaultEnterpriseIndexProcessorService.preEnterpriseIndexProcessor', // Will get executed just after data fetch from DB
        //     postProcessor: 'DefaultEnterpriseIndexProcessorService.postEnterpriseIndexProcessor', // will get executed once every data got collected and processed
        //     properties: {
        //         desc: {
        //             valueProvider: 'DefaultEnterpriseDescProviderService.getEnterpriseDescription'
        //         },
        //         custom: {
        //             enabled: true,
        //             valueProvider: 'DefaultEnterpriseDescProviderService.getEnterpriseCustom'
        //         }
        //     }
        // }
    }
};