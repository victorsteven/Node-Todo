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

    // dba.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5bb520a28b7b17d79242094e')
    //     }, 
    //     {
    //         $set: {
    //             text: 'Old man'
    //         }
    //     },
    //     {
    //         returnOriginal: false
    //     }
    // ).then(result => console.log(result));

    dba.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5bb5292e8b7b17d792420ef6')
    }, {
        $set: {
            name: 'Steven Victor'
        },
        $inc: {
            age: 5
        },
    },
    {
        returnOriginal: false
    }
).then(result => console.log(result));


    // db.close();
});
