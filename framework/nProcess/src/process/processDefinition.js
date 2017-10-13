module.exports = {
    defaultProcess: {
        nodes: {
            successEnd: {
                name: 'successEnd',
                type: 'function',
                process: 'PROCESS.handleSucessEnd'
            },
            failureEnd: {
                name: 'failureEnd',
                type: 'function',
                process: 'PROCESS.handleFailureEnd'
            },
            handleError: {
                name: 'handleError',
                type: 'function',
                process: 'PROCESS.handleErrorEnd'
            }
        }
    }
};