var jms = require('lightstreamer-jms-client');

jms.ConnectionFactory.createConnection("https://10.106.207.92:7222", "TIBCO", null, null, {
    onConnectionCreated: function(conn) {
        conn.setExceptionListener({
            onException: function(exception) {
                // Handle exceptions here
            }
        });

        var session = conn.createSession(false, "AUTO_ACK");
        var queue = session.createQueue("wf.application.Output");
        var producer = session.createProducer(queue, null);

        var msg = session.createTextMessage("some text");
        producer.send(msg);

        conn.start();

    },
    onConnectionFailed: function(errorCode, errorMessage) {
        // Handle server errors here, e.g.:
        alert("Server error: " + errorCode + " " + errorMessage);
    },
    onLSClient: function(lsClient) {

        // Add connection status logging (optional)
        lsClient.addListener({
            onStatusChange: function(newStatus) {
                console.log(newStatus);
            }
        });
    }
});