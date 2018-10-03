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

    // dba.collection('Todos').find({
    //     _id: new ObjectID('5bb40fb2e5e7ce04efd23e9a')
    // }).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, err => {
    //     console.log('Unable to fetch todos', err)
    // });

    // dba.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos are: ${count}`);
    // }, err => {
    //     console.log('Unable to fetch todos', err)
    // });

    dba.collection('Users').find({name: 'Steven Victor'}).toArray().then((docs) => {
        console.log(JSON.stringify(docs, undefined, 2));
    }, err => {
        console.log('Unable to fetch names', err)
    })
    
    // db.close();
});
