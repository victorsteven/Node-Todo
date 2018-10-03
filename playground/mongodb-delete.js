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

    // //deleteMany
    // dba.collection('Todos').deleteMany({text: 'ABA to do'}).then((result) => console.log(result));

    // //deleteOne
    // dba.collection('Todos').deleteOne({text: 'New man'}).then(result => console.log(result));

    //findOneAndDelete
    // dba.collection('Todos').findOneAndDelete({completed: false}).then(result => console.log(result));

    // dba.collection('Users').find({name: 'Lewis Paul'}).toArray().then((result) => console.log(result));

    // dba.collection('Users').findOneAndDelete({
    //     _id: new ObjectID('5bb3f9787da1c25cae105748')
    // }).then(result => console.log(result));

    //using callback
    // dba.collection('Users').deleteMany({name: 'Ali'}, (err, result) => {
    //     if(err){
    //         console.log(err)
    //     }else{
    //         console.log(result);
    //     }
    // })
    
    dba.collection('Users').deleteMany({name: 'Allison Obi'}, (err, result) => {
        if(err){
            console.log(err);
        }else{
            console.log(result);
        }
    });

    // dba.collection('Users').deleteMany({name: 'Steven Victor'}).then(result => console.log(result));
   

    // db.close();
});
