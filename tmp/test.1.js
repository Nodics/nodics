const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const assert = require('assert');
const _ = require('lodash');
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
    console.log(result);
    client.close();
  });
  */
  updateDocuments(db, function (error, result) {
    console.log(error, ' Result: ', result);
    client.close();
  });


  /*let array = [{
    name: 'himkar',
    lname: 'dwivedi'
  }, {
    name: 'himkar1',
    lname: 'dwivedi1'
  }];
  let model = array[1];
  model.lname = 'Pandey';
  console.log(array);*/
});

const removeDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Peform a simple find and return all the documents
  collection.deleteMany({ _id: '5b07482aa46fb30b5a295f7b' }, function (err, docs) {
    assert.equal(null, err);
    callback(docs.result);
  });
};

const findDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Peform a simple find and return all the documents
  collection.find({ _id: ObjectId('5b07482aa46fb30b5a295f7c') }).toArray(function (err, docs) {
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
    //assert.equal(1, result.result.n);
    //assert.equal(1, result.ops.length);
    console.log('Inserted 1 document into the collection');
    callback({ result: result.result, ops: result.ops });
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

const updateDocuments = function (db, callback) {
  const collection = db.collection('documents');
  /*let query = {
    '_id.tmc': 'add.streat'
  };*/
  //console.log(query);
  let models = {
    _id: ObjectId('5b94c89df6cbf344796de7e4'),
    firstName: 'James1',
    lastName: 'Bond2'
  };
  collection.findOneAndUpdate({
    _id: models._id
  }, { $set: models }, { upsert: true }).then(result => {
    callback(null, result);
  }).catch(error => {
    callback(error);
  });
  /*models.forEach((model => {
    if (model._id) {
      let query = _.merge({}, { '_id': '_id' });
      _.each(query, (value, property) => {
        let tmp = '';
        if (value.indexOf('.') > 0) {
          let values = value.split('.');
          tmp = model;
          values.forEach(element => {
            if (tmp[element]) {
              tmp = tmp[element];
            } else {
              throw new Error('Invalid property value for: ' + property + ' in ' + JSON.stringify(model));
            }
          });
        } else {
          tmp = model[value];
        }
        query[property] = tmp;
      });
      console.log('query: ', query);
      collection.findOneAndUpdate(query, {
        $set: model
      }, {
          upsert: true
        }).then(result => {
          console.log('Success Result: ', result);
        }).catch(error => {
          console.log('Error Result: ', error);
        })
    }
  }));*/
};
