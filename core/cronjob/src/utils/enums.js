module.exports = {
    CronJobState: {
        _options: {
            name: 'CronJobState',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'NEW',
            'RUNNING',
            'FINISHED'
        ]
    },
    CronJobStatus: {
        _options: {
            name: 'CronJobStatus',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'NEW',
            'SUCCESS',
            'FAILURE',
            'ERROR'
        ]
    },
    TriggerType: {
        _options: {
            name: 'TriggerType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'RANGES',
            'STEPS'
        ]
    },
    ObjectEnum: {
        _options: {
            name: 'ObjectEnum',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: {
            'None': 0,
            'Black': 1,
            'Red': 2,
            'Red2': 3,
            'Green': 4,
            'Blue': 5
        }
    },
};