/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    test: {
        runtimeTopology: {
            consolidatedServer: 'kickoffLocalServer',
            modularServers: [
                'kickoffLocalProfileServer',
                'kickoffLocalNemsServer',
                'kickoffLocalDeapServer',
                'kickoffLocalCronServer',
                'kickoffLocalCmsServer',
                'kickoffLocalWorkflowServer'
            ],
            communicationChecks: [
                {
                    server: 'kickoffLocalProfileServer',
                    moduleName: 'profile',
                    path: '/v0/ping?help'
                },
                {
                    server: 'kickoffLocalNemsServer',
                    moduleName: 'nems',
                    path: '/v0/ping?help'
                },
                {
                    server: 'kickoffLocalCronServer',
                    moduleName: 'cronjob',
                    path: '/v0/ping?help'
                },
                {
                    server: 'kickoffLocalWorkflowServer',
                    moduleName: 'workflow',
                    path: '/v0/ping?help'
                }
            ]
        }
    }
};
