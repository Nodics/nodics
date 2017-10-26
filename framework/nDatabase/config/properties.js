module.exports = {
    database: {
        default: {
            URI: 'mongodb://localhost:27017/userTest',
            options: {
                db: {
                    native_parser: true
                },
                server: {
                    poolSize: 5
                },
                replset: {
                    rs_name: 'myReplicaSetName'
                }
            }
        },
        /*
        user: {
            URI: 'mongodb://localhost:27017/userTest',
            options: {
                db: {
                    native_parser: true
                },
                server: {
                    poolSize: 5
                },
                replset: {
                    rs_name: 'myReplicaSetName'
                }
            }
        }*/
    }
};