/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module startio/envs/startioDev/monoServer/config/properties
 * @description Defines default envs configuration used during module startup and layering.
 * @layer config
 * @owner envs
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    activeModules: {
        groups: ['gCore', 'gDeap', 'modules'], // Group 'framework' will be included automatically
        modules: [
            'monoServer',
            'startioDev'
        ]
    },

    search: {
        default: {
            elastic: {
                connection: {
                    hosts: ['http://10.21.77.61:9200', 'http://10.21.77.61:9200'],
                }
            }
        }
    },

    database: {
        default: {
            mongodb: {
                master: {
                    //URI: 'mongodb://10.21.77.63:27017,10.21.77.64:27017,10.21.77.66:27017/?replicaSet=vms.mongo-01',
                    databaseName: 'teeDefaultMaster'
                },
                test: {
                    URI: 'mongodb://10.21.77.63:27017,10.21.77.64:27017,10.21.77.66:27017/?replicaSet=vms.mongo-01',
                    //databaseName: 'teeDefaultTest'
                }
            }
        }
    }
};
