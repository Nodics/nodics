{
    default: {
        base: {
            super: 'none',
            model: false,
            service: false,
            definition: [Object]
        }
    },
    cronjob: {
        email: {
            super: 'none',
            model: true,
            service: false,
            definition: [Object]
        },
        trigger: {
            super: 'none',
            model: true,
            service: false,
            definition: [Object]
        },
        cronJobLog: {
            super: 'base',
            model: true,
            service: false,
            event: false,
            definition: [Object]
        },
        cronJob: {
            super: 'base',
            model: true,
            service: true,
            event: false,
            refSchema: [Object],
            definition: [Object]
        }
    },
    nems: {
        event: {
            super: 'base',
            model: true,
            service: true,
            event: false,
            definition: [Object]
        },
        eventLog: {
            super: 'event',
            model: true,
            service: true,
            event: false,
            definition: {}
        }
    },
    profile: {
        address: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            definition: [Object]
        },
        contact: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            definition: [Object]
        },
        enterprice: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            refSchema: [Object],
            definition: [Object]
        },
        user: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            definition: [Object]
        },
        person: {
            super: 'user',
            model: true,
            service: true,
            definition: [Object]
        }
    }
}