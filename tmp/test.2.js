const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const assert = require('assert');
const _ = require('lodash');
const url = 'mongodb://localhost:27017';
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
  assert.equal(null, err);
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  insertDocument(db, function (result) {
    console.log('Returned document: ', result);
    client.close();
  });
});
const insertDocument = function (db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Insert some documents
  let model = {
    name: 'Himkar Dwivedi',
    role: 'Software Enginer',
    address: {
      flat: '163',
      building: 'B6',
      area: 'DLF',
      contact: {
        type: 'phone',
        num: '910xxxx882'
      }
    }
  };
  /*
    collection.insertOne(model, function (err, result) {
      console.log('Inserted 1 document into the collection: ', result.result);
    });
  */
  let originalQuery = {
    role: 'Software Enginer',
    name: '$name',
    "address.flat": "$flat"
  };
  let query = resolveQuery(
    originalQuery,
    model
  );
  console.log('Query: ', JSON.stringify(query));
  collection.find({
    query
  }).toArray(function (err, docs) {
    if (err) {
      console.log('Error: ', err);
    } else {
      callback(docs);
    }
  });
};

const resolveQuery = function (originalQuery, model) {
  let query = {};
  _.each(originalQuery, (propertyValue, propertyName) => {
    console.log('--------> ', propertyName);
    if (propertyName.indexOf(".") && propertyValue.startsWith('$')) {
      let properties = propertyName.split('.');
      let value = model;
      for (let element of properties) {
        if (value[element]) {
          value = value[element];
        } else {
          value = null;
          break;
        }
      }
      if (value) {
        query[propertyName] = value;
      }
    } else if (propertyValue.startsWith('$')) {
      console.log('  --------> ', propertyValue, ' : ', propertyValue.length);
      propertyValue = propertyValue.substring(1, propertyValue.length);
      console.log('  --------> ', propertyValue);
      if (model[propertyValue]) {
        console.log('  --------> ', model[propertyValue]);
        query[propertyName] = model[propertyValue];
      } else {
        throw new Error('could not find a valid property ' + propertyName);
      }
    } else {
      query[propertyName] = propertyValue;
    }
  });
  return query;
};