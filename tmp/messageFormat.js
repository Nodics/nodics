jsonMessage1 = {
    "enterpriseCode": "default",
    "tenant": "default",
    "name": "Nodics",
    "lastName": "Framework",
    "purpose": "Test json message push"
};

jsonMessage2 = {
    "code": "testEnt",
    "name": "testEnt",
    "active": false,
    "description": "Default Enterprise",
    "tenant": "default",
    "addresses": [
        "defaultEntAddress"
    ],
    "contacts": [
        "defaultEntContact"
    ]
}

//    ./kafka-console-producer.sh --broker-list localhost:9092 --topic kafkaInternalJsonSchemaDataConsumerQueue

xmlMessage1 = '<head><enterpriseCode>default</enterpriseCode><tenant>default</tenant><name>Nodics</name><lastName>Framework</lastName><purpose>Test XML message push</purpose></head>';

