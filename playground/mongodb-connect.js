//use MongoClient from the mongodb package
// const MongoClient = require('mongodb').MongoClient;
//using destructuring:
const {MongoClient, ObjectID} = require('mongodb');
// var obj = new ObjectID();
// console.log(obj);

// var user = {name: 'Mike', age: 25};
// //using destructuring: we make new variables from object properties
// var {name} = user; 
// console.log(name);
// var {age} = user;
// console.log(age);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err){
    //using the return statement will make the program halt if there was an error.
    return console.log('Unable to connet to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    const dba = db.db('TodoApp');
    dba.collection('Todos').insertOne({
        text: 'ABA to do',
        completed: false
    }, (err, result) => {
        if(err){
            return console.log('Unable to insert todo', err);
        }
        
        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    dba.collection('Users').insertOne({
        name: 'Steven Victor',
        age: 25,
        location: 'Jos'
    }, (err, result) => {
        if(err){
            return console.log('Unable to insert user', err);
        }
        //result.ups is an array of all the document that got inserted. when we are inserting only one, we are going to just one:
        console.log(result.ops[0]._id.getTimestamp());
    })
    db.close();
});



// const insertDocuments = (db, callback) => {
//     const collection = db.collection('Todos');

//     collection.insert({
//         text: 'Another to do',
//         completed: false
//     }, (err, result) => {
//         if(err){
//             return console.log('Unable to insert todo', err);
//         }
//         callback(result);
//     });
// }
  
//   const MongoClient = require('mongodb');
  
//   const url = 'mongodb://localhost:27017/TodoApp';
  
//   MongoClient.connect(url, (error, database) => {
//     if (error) return process.exit(1);
//     console.log('Connection is okay');
  
//     const db = database.db('TodoApp');
  
//     insertDocuments(db, () => {
//       console.log('Insert successful');
//     });
//   });