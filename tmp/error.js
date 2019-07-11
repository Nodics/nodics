module.export = {
    //     RequestError: Error: connect ECONNREFUSED 127.0.0.1: 3002
    //     at new RequestError(/Users/himkar.dwivedi / apps / HimProjects / nodics / node_modules / request - promise - core / lib / errors.js: 14: 15)
    //     at Request.plumbing.callback(/Users/himkar.dwivedi / apps / HimProjects / nodics / node_modules / request - promise - core / lib / plumbing.js: 87: 29)
    //     at Request.RP$callback[as _callback] (/Users/himkar.dwivedi / apps / HimProjects / nodics / node_modules / request - promise - core / lib / plumbing.js: 46: 31)
    // at self.callback(/Users/himkar.dwivedi / apps / HimProjects / nodics / node_modules / request / request.js: 185: 22)
    // at Request.emit(events.js: 198: 13)
    // at Request.onRequestError(/Users/himkar.dwivedi / apps / HimProjects / nodics / node_modules / request / request.js: 881: 8)
    // at ClientRequest.emit(events.js: 198: 13)
    // at Socket.socketErrorListener(_http_client.js: 392: 9)
    // at Socket.emit(events.js: 198: 13)
    // at emitErrorNT(internal / streams / destroy.js: 91: 8)
    // at emitErrorAndCloseNT(internal / streams / destroy.js: 59: 3)
    // at process._tickCallback(internal / process / next_tick.js: 63: 19)
    name: 'RequestError',
    message: 'Error: connect ECONNREFUSED 127.0.0.1:3002',
    cause: {
        Error: 'connect ECONNREFUSED 127.0.0.1: 3002 at TCPConnectWrap.afterConnect[as oncomplete](net.js: 1106: 14)',
        errno: 'ECONNREFUSED',
        code: 'ECONNREFUSED',
        syscall: 'connect',
        address: '127.0.0.1',
        port: 3002
    },
    error:
    {
        Error: 'connect ECONNREFUSED 127.0.0.1: 3002 at TCPConnectWrap.afterConnect[as oncomplete](net.js: 1106: 14)',
        errno: 'ECONNREFUSED',
        code: 'ECONNREFUSED',
        syscall: 'connect',
        address: '127.0.0.1',
        port: 3002
    },
    options:
    {
        method: 'GET',
        uri: 'http://localhost:3002/nodics/cronjob/ping',
        headers:
        {
            'content-type': 'application/json',
            authToken:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnRDb2RlIjoiZGVmYXVsdCIsInRlbmFudCI6ImRlZmF1bHQiLCJhcGlLZXkiOiI5NDQ1MTVhYy1iYmFjLTUxY2QtYWM3ZS0zYmJiYjNjODFiZmYiLCJpYXQiOjE1NjI2Njk2MzN9.oX7l5RgTpn01G_QovhY4LVY5YaF3vl0T0m4Cnq_Zwgk'
        },
        body: {},
        json: true,
        callback: '[Function: RP$callback]',
        transform: undefined,
        simple: true,
        resolveWithFullResponse: false,
        transform2xxOnly: false
    },
    response: undefined
};
