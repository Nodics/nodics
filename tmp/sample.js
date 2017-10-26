{
    modules: {
        nodics: {
            metaData: {
                name: 'nodics',
                index: '0',
                description: 'Nodics, A Node based enterprise application solution',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: [Object]
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics'
        },
        core: {
            metaData: {
                name: 'core',
                index: '100',
                description: 'Module core, groups all core module in Nodics framework',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/core'
        },
        cronjob: {
            metaData: {
                name: 'cronjob',
                index: '101',
                publish: 'true',
                description: 'Module cronJob, handle schedulled execution process',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/core/cronjob',
            rawSchema: {
                email: [Object],
                trigger: [Object],
                cronJob: [Object],
                base: [Object]
            },
            schemas: {
                master: {
                    email: [Object],
                    trigger: [Object],
                    cronJob: [Object],
                    base: [Object]
                },
                test: {
                    email: [Object],
                    trigger: [Object],
                    cronJob: [Object],
                    base: [Object]
                }
            },
            models: {
                master: {
                    email: [Object],
                    trigger: [Object],
                    cronJob: [Object]
                },
                test: {
                    email: [Object],
                    trigger: [Object],
                    cronJob: [Object]
                }
            }
        },
        user: {
            metaData: {
                name: 'user',
                index: '110',
                publish: 'true',
                description: 'Module user, process user related information',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/core/user',
            rawSchema: { user: [Object], person: [Object], base: [Object] },
            schemas: { base: [Object], user: [Object], person: [Object] },
            models: { UserModel: [Object], PersonModel: [Object] }
        },
        framework: {
            metaData: {
                name: 'framework',
                index: '20',
                description: 'This module is a collection of framework related modules',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework'
        },
        ncommon: {
            metaData: {
                name: 'ncommon',
                index: '2',
                description: 'Build common functionalities for Nodics',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nCommon'
        },
        nconfig: {
            metaData: {
                name: 'nconfig',
                index: '1',
                description: 'Build configuration related functionalities for Nodics',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nConfig'
        },
        ncontroller: {
            metaData: {
                name: 'ncontroller',
                index: '9',
                description: 'Build OOTB controllers for Nodics',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nController'
        },
        ncronjob: {
            metaData: {
                name: 'ncronjob',
                index: '7',
                description: 'Generate CronJob related items and its processess',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nCronJob'
        },
        ndao: {
            metaData: {
                name: 'ndao',
                index: '4',
                description: 'Generate DAO layer for all defined items',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nDao'
        },
        ndatabase: {
            metaData: {
                name: 'ndatabase',
                index: '3',
                description: 'Manage database connections and configuration',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nDatabase'
        },
        nfacade: {
            metaData: {
                name: 'nfacade',
                index: '8',
                description: 'Generate facade layer for application',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nFacade'
        },
        nprocess: {
            metaData: {
                name: 'nprocess',
                index: '6',
                description: 'Generate Process configurations',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nProcess'
        },
        nrouter: {
            metaData: {
                name: 'nrouter',
                index: '10',
                description: 'Register routers for all defined items',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nRouter'
        },
        nservice: {
            metaData: {
                name: 'nservice',
                index: '5',
                description: 'Generate services for all defined items',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/framework/nService'
        },
        server: {
            metaData: {
                name: 'server',
                index: '1000',
                description: 'This module represent sample custom application to start Nodics',
                homepage: 'http://www.nodics.com/',
                keywords: [Array],
                author: 'Nodics Framework <nodics.framework@gmail.com>',
                main: 'nodics.js',
                version: '0.0.1',
                private: true,
                license: 'GNU General Public License v3',
                scripts: {},
                repository: [Object],
                dependencies: {}
            },
            modulePath: '/Users/baba/apps/HimProjects/nodics/server'
        },
        default: {
            app: {
                [EventEmitter: app]
                domain: undefined,
                _events: [Object],
                _maxListeners: undefined,
                setMaxListeners: [Function: setMaxListeners],
                getMaxListeners: [Function: getMaxListeners],
                emit: [Function: emit],
                addListener: [Function: addListener],
                on: [Function: addListener],
                prependListener: [Function: prependListener],
                once: [Function: once],
                prependOnceListener: [Function: prependOnceListener],
                removeListener: [Function: removeListener],
                removeAllListeners: [Function: removeAllListeners],
                listeners: [Function: listeners],
                listenerCount: [Function: listenerCount],
                eventNames: [Function: eventNames],
                init: [Function: init],
                defaultConfiguration: [Function: defaultConfiguration],
                lazyrouter: [Function: lazyrouter],
                handle: [Function: handle],
                use: [Function: use],
                route: [Function: route],
                engine: [Function: engine],
                param: [Function: param],
                set: [Function: set],
                path: [Function: path],
                enabled: [Function: enabled],
                disabled: [Function: disabled],
                enable: [Function: enable],
                disable: [Function: disable],
                acl: [Function],
                bind: [Function],
                checkout: [Function],
                connect: [Function],
                copy: [Function],
                delete: [Function],
                get: [Function],
                head: [Function],
                link: [Function],
                lock: [Function],
                'm-search': [Function],
                merge: [Function],
                mkactivity: [Function],
                mkcalendar: [Function],
                mkcol: [Function],
                move: [Function],
                notify: [Function],
                options: [Function],
                patch: [Function],
                post: [Function],
                propfind: [Function],
                proppatch: [Function],
                purge: [Function],
                put: [Function],
                rebind: [Function],
                report: [Function],
                search: [Function],
                subscribe: [Function],
                trace: [Function],
                unbind: [Function],
                unlink: [Function],
                unlock: [Function],
                unsubscribe: [Function],
                all: [Function: all],
                del: [Function],
                render: [Function: render],
                listen: [Function: listen],
                request: [Object],
                response: [Object],
                cache: {},
                engines: {},
                settings: [Object],
                _eventsCount: 1,
                locals: [Object],
                mountpath: '/'
            }
        }
    },
    dbs: {
        default: {
            URI: 'mongodb://localhost:27017/userTest',
            options: { db: [Object], server: [Object], replset: [Object] },
            connection: Mongoose {
                connections: [Array],
                models: [Object],
                modelSchemas: [Object],
                options: [Object],
                plugins: [Array]
            },
            Schema: {
                [Function: Schema]
                reserved: [Object],
                interpretAsType: [Function],
                Types: [Object],
                ObjectId: [Object]
            }
        },
        user: {
            URI: 'mongodb://localhost:27017/userTest',
            options: { db: [Object], server: [Object], replset: [Object] },
            connection: Mongoose {
                connections: [Array],
                models: [Object],
                modelSchemas: [Object],
                options: [Object],
                plugins: [Array]
            },
            Schema: {
                [Function: Schema]
                reserved: [Object],
                interpretAsType: [Function],
                Types: [Object],
                ObjectId: [Object]
            }
        }
    },
    validators: { checkIfCreatedDateIsNull: [Function: checkIfCreatedDateIsNull] }
}