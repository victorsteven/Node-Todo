const {ObjectID} = require('mongodb');

const {mongoose} = require("./../server/db/mongoose");
const {Todo} = require('./../server/models/Todo');
const {User} = require('./../server/models/User');


// var id = '5bb5cadc9ee92a2c0be2b0ef11';
// if(!ObjectID.isValid(id)){
//     console.log('ID not valid')
// }

// Todo.find({
//     _id: id
// }).then(todos => console.log(todos));

// Todo.findOne({
//     _id: id
// }).then(todo => console.log('Todo find one:', todo))

// Todo.findById(id).then(todo  => {
//     if(!todo){
//         // console.log('ID not found'); //this will not prevent the next line from printing

//         return console.log('ID not found'); //this will prevent any other thing from running
//     }
//     console.log('Todo by id:', todo)
// }).catch((e) => console.log(e));

// var newUser = new User({
//     email: 'andy@gmail.com'
// });
// newUser.save().then(result => {
//     console.log('User saved successfully');
// }, e => console.log(e))

var id = '5bb5d28e47f7fc3691904a72';
User.findById(id).then(user => {
    if(!user){
        return console.log('User not found')
    }
    console.log('User is: ', JSON.stringify(user, undefined, 2))
}, (e) => console.log(e));