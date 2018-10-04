var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/Todo');
var {User} = require('./models/User');


var app = express();

//with the code below, we can send json data to our express app
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    // console.log(req.body);
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc) => {
        res.send(doc); //send this to the user
    }, err => res.status(400).send(err));
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        // res.send(todos) // if we want to pass the array back
        res.send({todos}) //we are passing the object

    }, e => res.status(400).send(e));
});

app.listen(3000, () => {
    console.log('Started at port 3000')
});

module.exports = {app};



// var newTodo = new Todo({
//     text: 'Cook dinner'
// });
// newTodo.save().then((doc) => {
//     console.log('Saved todo', doc)
// }, (e) => {
//     console.log('Unable to save todo', e);  
// });


// var user = new User({
//     email: '   obi@gmail.com   '
// });
// user.save().then((result) => {
//     console.log(result)
// }, err => console.log(err))