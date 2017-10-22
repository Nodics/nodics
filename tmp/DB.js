{
    default: {
        URI: 'mongodb://localhost:27017/userTest',
        options: {
            db: { native_parser: true },
            server: { poolSize: 5 },
            replset: { rs_name: 'myReplicaSetName' }
        },
        connection: Mongoose {
            connections: [NativeConnection {
                base: [Circular],
                collections: [Object],
                models: [Object],
                config: [Object],
                replica: false,
                hosts: null,
                host: 'localhost',
                port: 27017,
                user: undefined,
                pass: undefined,
                name: 'userTest',
                options: [Object],
                otherDbs: [],
                _readyState: 2,
                _closeCalled: false,
                _hasOpened: false,
                _listening: false,
                db: [Object],
                _events: [Object],
                _eventsCount: 3
            }],
            models: {
                EmailModel: {
                    [Function: model]
                    hooks: [Object],
                    base: [Circular],
                    modelName: 'EmailModel',
                    model: [Function: model],
                    db: [Object],
                    discriminators: undefined,
                    '$appliedHooks': true,
                    _events: [Object],
                    _eventsCount: 2,
                    schema: [Object],
                    collection: [Object],
                    Query: [Object],
                    '$__insertMany': [Function],
                    insertMany: [Function]
                },
                TriggerModel: {
                    [Function: model]
                    hooks: [Object],
                    base: [Circular],
                    modelName: 'TriggerModel',
                    model: [Function: model],
                    db: [Object],
                    discriminators: undefined,
                    '$appliedHooks': true,
                    _events: [Object],
                    _eventsCount: 2,
                    schema: [Object],
                    collection: [Object],
                    Query: [Object],
                    '$__insertMany': [Function],
                    insertMany: [Function]
                },
                CronJobModel: {
                    [Function: model]
                    hooks: [Object],
                    base: [Circular],
                    modelName: 'CronJobModel',
                    model: [Function: model],
                    db: [Object],
                    discriminators: undefined,
                    '$appliedHooks': true,
                    _events: [Object],
                    _eventsCount: 2,
                    schema: [Object],
                    collection: [Object],
                    Query: [Object],
                    '$__insertMany': [Function],
                    insertMany: [Function]
                },
                UserModel: {
                    [Function: model]
                    hooks: [Object],
                    base: [Circular],
                    modelName: 'UserModel',
                    model: [Function: model],
                    db: [Object],
                    discriminators: undefined,
                    '$appliedHooks': true,
                    _events: [Object],
                    _eventsCount: 2,
                    schema: [Object],
                    collection: [Object],
                    Query: [Object],
                    '$__insertMany': [Function],
                    insertMany: [Function]
                },
                PersonModel: {
                    [Function: model]
                    hooks: [Object],
                    base: [Circular],
                    modelName: 'PersonModel',
                    model: [Function: model],
                    db: [Object],
                    discriminators: undefined,
                    '$appliedHooks': true,
                    _events: [Object],
                    _eventsCount: 2,
                    schema: [Object],
                    collection: [Object],
                    Query: [Object],
                    '$__insertMany': [Function],
                    insertMany: [Function]
                }
            },
            modelSchemas: {
                EmailModel: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: {},
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                },
                TriggerModel: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: {},
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                },
                CronJobModel: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: [Object],
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [Array],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                },
                UserModel: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: {},
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                },
                PersonModel: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: {},
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                }
            },
            options: { pluralization: true },
            plugins: [
                [
                    [Function],
                    [Object]
                ],
                [
                    [Function],
                    [Object]
                ],
                [
                    [Object],
                    [Object]
                ]
            ]
        },
        Schema: {
            [Function: Schema]
            reserved: {
                _posts: 1,
                _pres: 1,
                remove: 1,
                validate: 1,
                toObject: 1,
                set: 1,
                schema: 1,
                save: 1,
                modelName: 1,
                get: 1,
                isNew: 1,
                isModified: 1,
                init: 1,
                errors: 1,
                db: 1,
                collection: 1,
                removeListener: 1,
                listeners: 1,
                once: 1,
                on: 1,
                emit: 1,
                prototype: 1
            },
            interpretAsType: [Function],
            Types: {
                String: {
                    [Function: SchemaString] schemaName: 'String'
                },
                Number: {
                    [Function: SchemaNumber] schemaName: 'Number'
                },
                Boolean: {
                    [Function: SchemaBoolean] schemaName: 'Boolean',
                    '$conditionalHandlers': [Object]
                },
                DocumentArray: {
                    [Function: DocumentArray] schemaName: 'DocumentArray'
                },
                Embedded: [Function: Embedded],
                Array: {
                    [Function: SchemaArray] schemaName: 'Array'
                },
                Buffer: {
                    [Function: SchemaBuffer] schemaName: 'Buffer'
                },
                Date: {
                    [Function: SchemaDate] schemaName: 'Date'
                },
                ObjectId: {
                    [Function: ObjectId] schemaName: 'ObjectId'
                },
                Mixed: {
                    [Function: Mixed] schemaName: 'Mixed'
                },
                Decimal: {
                    [Function: Decimal128] schemaName: 'Decimal128'
                },
                Decimal128: {
                    [Function: Decimal128] schemaName: 'Decimal128'
                },
                Oid: {
                    [Function: ObjectId] schemaName: 'ObjectId'
                },
                Object: {
                    [Function: Mixed] schemaName: 'Mixed'
                },
                Bool: {
                    [Function: SchemaBoolean] schemaName: 'Boolean',
                    '$conditionalHandlers': [Object]
                }
            },
            ObjectId: {
                [Function: ObjectId] schemaName: 'ObjectId'
            }
        },
        rawschema: {
            base: {
                super: 'none',
                model: false,
                service: false,
                definition: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object]
                }
            },
            email: {
                super: 'none',
                model: true,
                service: false,
                definition: { mailId: 'String' },
                moduleName: 'cronjob'
            },
            trigger: {
                super: 'none',
                model: true,
                service: false,
                definition: {
                    triggerId: [Object],
                    triggerName: [Object],
                    triggerType: [Object],
                    isActive: [Object],
                    second: [Object],
                    minute: [Object],
                    hour: [Object],
                    day: [Object],
                    month: [Object],
                    year: [Object],
                    expression: [Object]
                },
                moduleName: 'cronjob'
            },
            cronJob: {
                super: 'base',
                model: true,
                service: true,
                definition: {
                    name: [Object],
                    state: [Object],
                    lastResult: [Object],
                    lastStartTime: [Object],
                    lastEndTime: [Object],
                    lastSuccessTime: [Object],
                    clusterId: 'Number',
                    priority: [Object],
                    runOnInit: 'Boolean',
                    emails: [Array],
                    triggers: [Array],
                    jobDetail: [Object]
                },
                moduleName: 'cronjob'
            },
            user: {
                super: 'base',
                model: true,
                service: true,
                definition: { firstName: 'String', lastName: 'String', name: [Object] },
                moduleName: 'user'
            },
            person: {
                super: 'user',
                model: true,
                service: true,
                definition: { displayName: 'String' },
                moduleName: 'user'
            }
        },
        schemas: {
            base: Schema {
                obj: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object]
                },
                paths: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object],
                    _id: [Object]
                },
                aliases: {},
                subpaths: {},
                virtuals: { id: [Object] },
                singleNestedPaths: {},
                nested: {},
                inherits: {},
                callQueue: [
                    [Array]
                ],
                _indexes: [],
                methods: {},
                statics: {},
                tree: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object],
                    _id: [Object],
                    id: [Object]
                },
                query: {},
                childSchemas: [],
                plugins: [],
                s: { hooks: [Object], kareemHooks: [Object] },
                options: {
                    retainKeyOrder: false,
                    typeKey: 'type',
                    id: true,
                    noVirtualId: false,
                    _id: true,
                    noId: false,
                    validateBeforeSave: true,
                    read: null,
                    shardKey: null,
                    autoIndex: null,
                    minimize: true,
                    discriminatorKey: '__t',
                    versionKey: '__v',
                    capped: false,
                    bufferCommands: true,
                    strict: true
                }
            },
            email: Schema {
                obj: { mailId: 'String' },
                paths: { mailId: [Object], _id: [Object], __v: [Object] },
                aliases: {},
                subpaths: {},
                virtuals: { id: [Object] },
                singleNestedPaths: {},
                nested: {},
                inherits: {},
                callQueue: [
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array]
                ],
                _indexes: [],
                methods: {},
                statics: {},
                tree: {
                    mailId: 'String',
                    _id: [Object],
                    id: [Object],
                    __v: [Function: Number]
                },
                query: {},
                childSchemas: [],
                plugins: [
                    [Object],
                    [Object],
                    [Object]
                ],
                s: { hooks: [Object], kareemHooks: [Object] },
                options: {
                    retainKeyOrder: false,
                    typeKey: 'type',
                    id: true,
                    noVirtualId: false,
                    _id: true,
                    noId: false,
                    validateBeforeSave: true,
                    read: null,
                    shardKey: null,
                    autoIndex: null,
                    minimize: true,
                    discriminatorKey: '__t',
                    versionKey: '__v',
                    capped: false,
                    bufferCommands: true,
                    strict: true,
                    pluralization: true
                },
                '$globalPluginsApplied': true
            },
            trigger: Schema {
                obj: {
                    triggerId: [Object],
                    triggerName: [Object],
                    triggerType: [Object],
                    isActive: [Object],
                    second: [Object],
                    minute: [Object],
                    hour: [Object],
                    day: [Object],
                    month: [Object],
                    year: [Object],
                    expression: [Object]
                },
                paths: {
                    triggerId: [Object],
                    triggerName: [Object],
                    triggerType: [Object],
                    isActive: [Object],
                    second: [Object],
                    minute: [Object],
                    hour: [Object],
                    day: [Object],
                    month: [Object],
                    year: [Object],
                    expression: [Object],
                    _id: [Object],
                    __v: [Object]
                },
                aliases: {},
                subpaths: {},
                virtuals: { id: [Object] },
                singleNestedPaths: {},
                nested: {},
                inherits: {},
                callQueue: [
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array]
                ],
                _indexes: [],
                methods: {},
                statics: {},
                tree: {
                    triggerId: [Object],
                    triggerName: [Object],
                    triggerType: [Object],
                    isActive: [Object],
                    second: [Object],
                    minute: [Object],
                    hour: [Object],
                    day: [Object],
                    month: [Object],
                    year: [Object],
                    expression: [Object],
                    _id: [Object],
                    id: [Object],
                    __v: [Function: Number]
                },
                query: {},
                childSchemas: [],
                plugins: [
                    [Object],
                    [Object],
                    [Object]
                ],
                s: { hooks: [Object], kareemHooks: [Object] },
                options: {
                    retainKeyOrder: false,
                    typeKey: 'type',
                    id: true,
                    noVirtualId: false,
                    _id: true,
                    noId: false,
                    validateBeforeSave: true,
                    read: null,
                    shardKey: null,
                    autoIndex: null,
                    minimize: true,
                    discriminatorKey: '__t',
                    versionKey: '__v',
                    capped: false,
                    bufferCommands: true,
                    strict: true,
                    pluralization: true
                },
                '$globalPluginsApplied': true
            },
            cronJob: Schema {
                obj: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object]
                },
                paths: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object],
                    _id: [Object],
                    name: [Object],
                    state: [Object],
                    lastResult: [Object],
                    lastStartTime: [Object],
                    lastEndTime: [Object],
                    lastSuccessTime: [Object],
                    clusterId: [Object],
                    priority: [Object],
                    runOnInit: [Object],
                    emails: [Object],
                    triggers: [Object],
                    'jobDetail.startNode': [Object],
                    'jobDetail.endNode': [Object],
                    'jobDetail.errorNode': [Object],
                    'name_unique.type': [Object],
                    'name_unique.coordinates': [Object],
                    __t: [Object],
                    __v: [Object]
                },
                aliases: {},
                subpaths: {},
                virtuals: { id: [Object] },
                singleNestedPaths: {},
                nested: { jobDetail: true, name_unique: true },
                inherits: {},
                callQueue: [
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array]
                ],
                _indexes: [
                    [Array]
                ],
                methods: {},
                statics: {},
                tree: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object],
                    _id: [Object],
                    id: [Object],
                    name: [Object],
                    state: [Object],
                    lastResult: [Object],
                    lastStartTime: [Object],
                    lastEndTime: [Object],
                    lastSuccessTime: [Object],
                    clusterId: 'Number',
                    priority: [Object],
                    runOnInit: 'Boolean',
                    emails: [Array],
                    triggers: [Array],
                    jobDetail: [Object],
                    name_unique: [Object],
                    __t: [Object],
                    __v: [Function: Number]
                },
                query: {},
                childSchemas: [],
                plugins: [
                    [Object],
                    [Object],
                    [Object]
                ],
                s: { hooks: [Object], kareemHooks: [Object] },
                options: {
                    retainKeyOrder: false,
                    typeKey: 'type',
                    id: true,
                    noVirtualId: false,
                    _id: true,
                    noId: false,
                    validateBeforeSave: true,
                    read: null,
                    shardKey: null,
                    autoIndex: null,
                    minimize: true,
                    discriminatorKey: '__t',
                    versionKey: '__v',
                    capped: false,
                    bufferCommands: true,
                    strict: true,
                    pluralization: true
                },
                '$globalPluginsApplied': true
            },
            user: Schema {
                obj: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object]
                },
                paths: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object],
                    _id: [Object],
                    firstName: [Object],
                    lastName: [Object],
                    name: [Object],
                    __t: [Object],
                    __v: [Object]
                },
                aliases: {},
                subpaths: {},
                virtuals: { id: [Object] },
                singleNestedPaths: {},
                nested: {},
                inherits: {},
                callQueue: [
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array]
                ],
                _indexes: [],
                methods: {},
                statics: {},
                tree: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object],
                    _id: [Object],
                    id: [Object],
                    firstName: 'String',
                    lastName: 'String',
                    name: [Object],
                    __t: [Object],
                    __v: [Function: Number]
                },
                query: {},
                childSchemas: [],
                plugins: [
                    [Object],
                    [Object],
                    [Object]
                ],
                s: { hooks: [Object], kareemHooks: [Object] },
                options: {
                    retainKeyOrder: false,
                    typeKey: 'type',
                    id: true,
                    noVirtualId: false,
                    _id: true,
                    noId: false,
                    validateBeforeSave: true,
                    read: null,
                    shardKey: null,
                    autoIndex: null,
                    minimize: true,
                    discriminatorKey: '__t',
                    versionKey: '__v',
                    capped: false,
                    bufferCommands: true,
                    strict: true,
                    pluralization: true
                },
                '$globalPluginsApplied': true
            },
            person: Schema {
                obj: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object]
                },
                paths: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object],
                    _id: [Object],
                    firstName: [Object],
                    lastName: [Object],
                    name: [Object],
                    __t: [Object],
                    displayName: [Object],
                    __v: [Object]
                },
                aliases: {},
                subpaths: {},
                virtuals: { id: [Object] },
                singleNestedPaths: {},
                nested: {},
                inherits: {},
                callQueue: [
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array],
                    [Array]
                ],
                _indexes: [],
                methods: {},
                statics: {},
                tree: {
                    code: [Object],
                    creationDate: [Object],
                    updatedDate: [Object],
                    testProperty: [Object],
                    _id: [Object],
                    id: [Object],
                    firstName: 'String',
                    lastName: 'String',
                    name: [Object],
                    __t: [Object],
                    displayName: 'String',
                    __v: [Function: Number]
                },
                query: {},
                childSchemas: [],
                plugins: [
                    [Object],
                    [Object],
                    [Object]
                ],
                s: { hooks: [Object], kareemHooks: [Object] },
                options: {
                    retainKeyOrder: false,
                    typeKey: 'type',
                    id: true,
                    noVirtualId: false,
                    _id: true,
                    noId: false,
                    validateBeforeSave: true,
                    read: null,
                    shardKey: null,
                    autoIndex: null,
                    minimize: true,
                    discriminatorKey: '__t',
                    versionKey: '__v',
                    capped: false,
                    bufferCommands: true,
                    strict: true,
                    pluralization: true
                },
                '$globalPluginsApplied': true
            }
        },
        models: {
            EmailModel: {
                [Function: model]
                hooks: Kareem { _pres: {}, _posts: {} },
                base: Mongoose {
                    connections: [Array],
                    models: [Object],
                    modelSchemas: [Object],
                    options: [Object],
                    plugins: [Array]
                },
                modelName: 'EmailModel',
                model: [Function: model],
                db: NativeConnection {
                    base: [Object],
                    collections: [Object],
                    models: [Object],
                    config: [Object],
                    replica: false,
                    hosts: null,
                    host: 'localhost',
                    port: 27017,
                    user: undefined,
                    pass: undefined,
                    name: 'userTest',
                    options: [Object],
                    otherDbs: [],
                    _readyState: 2,
                    _closeCalled: false,
                    _hasOpened: false,
                    _listening: false,
                    db: [Object],
                    _events: [Object],
                    _eventsCount: 3
                },
                discriminators: undefined,
                '$appliedHooks': true,
                _events: { save: [Array], init: [Function] },
                _eventsCount: 2,
                schema: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: {},
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                },
                collection: NativeCollection {
                    collection: null,
                    opts: [Object],
                    name: 'emailmodels',
                    collectionName: 'emailmodels',
                    conn: [Object],
                    queue: [],
                    buffer: true,
                    emitter: [Object]
                },
                Query: {
                    [Function] base: [Object]
                },
                '$__insertMany': [Function],
                insertMany: [Function]
            },
            TriggerModel: {
                [Function: model]
                hooks: Kareem { _pres: {}, _posts: {} },
                base: Mongoose {
                    connections: [Array],
                    models: [Object],
                    modelSchemas: [Object],
                    options: [Object],
                    plugins: [Array]
                },
                modelName: 'TriggerModel',
                model: [Function: model],
                db: NativeConnection {
                    base: [Object],
                    collections: [Object],
                    models: [Object],
                    config: [Object],
                    replica: false,
                    hosts: null,
                    host: 'localhost',
                    port: 27017,
                    user: undefined,
                    pass: undefined,
                    name: 'userTest',
                    options: [Object],
                    otherDbs: [],
                    _readyState: 2,
                    _closeCalled: false,
                    _hasOpened: false,
                    _listening: false,
                    db: [Object],
                    _events: [Object],
                    _eventsCount: 3
                },
                discriminators: undefined,
                '$appliedHooks': true,
                _events: { save: [Array], init: [Function] },
                _eventsCount: 2,
                schema: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: {},
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                },
                collection: NativeCollection {
                    collection: null,
                    opts: [Object],
                    name: 'triggermodels',
                    collectionName: 'triggermodels',
                    conn: [Object],
                    queue: [],
                    buffer: true,
                    emitter: [Object]
                },
                Query: {
                    [Function] base: [Object]
                },
                '$__insertMany': [Function],
                insertMany: [Function]
            },
            CronJobModel: {
                [Function: model]
                hooks: Kareem { _pres: {}, _posts: {} },
                base: Mongoose {
                    connections: [Array],
                    models: [Object],
                    modelSchemas: [Object],
                    options: [Object],
                    plugins: [Array]
                },
                modelName: 'CronJobModel',
                model: [Function: model],
                db: NativeConnection {
                    base: [Object],
                    collections: [Object],
                    models: [Object],
                    config: [Object],
                    replica: false,
                    hosts: null,
                    host: 'localhost',
                    port: 27017,
                    user: undefined,
                    pass: undefined,
                    name: 'userTest',
                    options: [Object],
                    otherDbs: [],
                    _readyState: 2,
                    _closeCalled: false,
                    _hasOpened: false,
                    _listening: false,
                    db: [Object],
                    _events: [Object],
                    _eventsCount: 3
                },
                discriminators: undefined,
                '$appliedHooks': true,
                _events: { save: [Array], init: [Function] },
                _eventsCount: 2,
                schema: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: [Object],
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [Array],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                },
                collection: NativeCollection {
                    collection: null,
                    opts: [Object],
                    name: 'cronjobmodels',
                    collectionName: 'cronjobmodels',
                    conn: [Object],
                    queue: [],
                    buffer: true,
                    emitter: [Object]
                },
                Query: {
                    [Function] base: [Object]
                },
                '$__insertMany': [Function],
                insertMany: [Function]
            },
            UserModel: {
                [Function: model]
                hooks: Kareem { _pres: {}, _posts: {} },
                base: Mongoose {
                    connections: [Array],
                    models: [Object],
                    modelSchemas: [Object],
                    options: [Object],
                    plugins: [Array]
                },
                modelName: 'UserModel',
                model: [Function: model],
                db: NativeConnection {
                    base: [Object],
                    collections: [Object],
                    models: [Object],
                    config: [Object],
                    replica: false,
                    hosts: null,
                    host: 'localhost',
                    port: 27017,
                    user: undefined,
                    pass: undefined,
                    name: 'userTest',
                    options: [Object],
                    otherDbs: [],
                    _readyState: 2,
                    _closeCalled: false,
                    _hasOpened: false,
                    _listening: false,
                    db: [Object],
                    _events: [Object],
                    _eventsCount: 3
                },
                discriminators: undefined,
                '$appliedHooks': true,
                _events: { save: [Array], init: [Function] },
                _eventsCount: 2,
                schema: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: {},
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                },
                collection: NativeCollection {
                    collection: null,
                    opts: [Object],
                    name: 'usermodels',
                    collectionName: 'usermodels',
                    conn: [Object],
                    queue: [],
                    buffer: true,
                    emitter: [Object]
                },
                Query: {
                    [Function] base: [Object]
                },
                '$__insertMany': [Function],
                insertMany: [Function]
            },
            PersonModel: {
                [Function: model]
                hooks: Kareem { _pres: {}, _posts: {} },
                base: Mongoose {
                    connections: [Array],
                    models: [Object],
                    modelSchemas: [Object],
                    options: [Object],
                    plugins: [Array]
                },
                modelName: 'PersonModel',
                model: [Function: model],
                db: NativeConnection {
                    base: [Object],
                    collections: [Object],
                    models: [Object],
                    config: [Object],
                    replica: false,
                    hosts: null,
                    host: 'localhost',
                    port: 27017,
                    user: undefined,
                    pass: undefined,
                    name: 'userTest',
                    options: [Object],
                    otherDbs: [],
                    _readyState: 2,
                    _closeCalled: false,
                    _hasOpened: false,
                    _listening: false,
                    db: [Object],
                    _events: [Object],
                    _eventsCount: 3
                },
                discriminators: undefined,
                '$appliedHooks': true,
                _events: { save: [Array], init: [Function] },
                _eventsCount: 2,
                schema: Schema {
                    obj: [Object],
                    paths: [Object],
                    aliases: {},
                    subpaths: {},
                    virtuals: [Object],
                    singleNestedPaths: {},
                    nested: {},
                    inherits: {},
                    callQueue: [Array],
                    _indexes: [],
                    methods: {},
                    statics: {},
                    tree: [Object],
                    query: {},
                    childSchemas: [],
                    plugins: [Array],
                    s: [Object],
                    options: [Object],
                    '$globalPluginsApplied': true
                },
                collection: NativeCollection {
                    collection: null,
                    opts: [Object],
                    name: 'personmodels',
                    collectionName: 'personmodels',
                    conn: [Object],
                    queue: [],
                    buffer: true,
                    emitter: [Object]
                },
                Query: {
                    [Function] base: [Object]
                },
                '$__insertMany': [Function],
                insertMany: [Function]
            }
        }
    },
    validators: { checkIfCreatedDateIsNull: [Function: checkIfCreatedDateIsNull] }
}