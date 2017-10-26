module.exports = {
    database: {
        default: {
            master: {
                URI: 'mongodb://localhost:27017/userTest',
                options: {
                    db: {
                        native_parser: true
                    },
                    server: {
                        poolSize: 5
                    }
                }
            },
            test: {
                URI: 'mongodb://localhost:27017/nodicsTest',
                options: {
                    db: {
                        native_parser: true
                    },
                    server: {
                        poolSize: 5
                    }
                }
            }

        },
        /*
        user: {
            master: {
                URI: 'mongodb://localhost:27017/userTest',
                options: {
                    db: {
                        native_parser: true
                    },
                    server: {
                        poolSize: 5
                    }
                }
            }
        }*/
    }
};