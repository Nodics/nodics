const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
  assert.equal(null, err);
  console.log('Connected successfully to server');

  const db = client.db(dbName);

  /*removeDocuments(db, function (result) {
    console.log('Removed : ', result)
    client.close()
  })
  findDocuments(db, function (result) {
    console.log('Find : ', result)
    client.close()
  })

  insertDocument(db, function (result) {
  console.log(result)
  client.close()
  })*/
  insertDocuments(db, function (result) {
    console.log(result);
    client.close();
  });
});

const removeDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Peform a simple find and return all the documents
  collection.deleteMany({_id: '5b07482aa46fb30b5a295f7b'}, function (err, docs) {
    assert.equal(null, err);
    callback(docs.result);
  });
};

const findDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Peform a simple find and return all the documents
  collection.find({_id: ObjectId('5b07482aa46fb30b5a295f7c')}).toArray(function (err, docs) {
    assert.equal(null, err);
    callback(docs);
  });
};

const insertDocument = function (db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Insert some documents
  collection.insertOne({
    firstName: 'James1',
    lastName: 'Bond1'
  }, function (err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log('Inserted 1 document into the collection');
    callback({result: result.result, ops: result.ops});
  });
};

const insertDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {
      '_id': ObjectId('5b07482aa46fb30b5a295f7c'),
      firstName: 'Steve',
      lastName: 'Jobs'
    }, {
      '_id': '5b07482aa46fb30b5a295f7b',
      firstName: 'Bill',
      lastName: 'Gates'
    }, {
      firstName: 'James',
      lastName: 'Bond'
    }
  ], function (err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log('Inserted 3 documents into the collection');
    callback(result);
  });
};
