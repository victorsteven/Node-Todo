require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/Todo');
var {User} = require('./models/User');


var app = express();
const port = process.env.PORT || 3000;

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

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        // return console.log('ID is not valid')
        return res.status(404).send();
    }
    Todo.findById(id).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo})
    }).catch(e => res.status(400).send())
})

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo})
    }).catch(e => res.status(400).send())
})

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']); //this is what the user can update
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    }else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch(e => {
        res.status(400).send();
    }); 
});


app.listen(port, () => {
    console.log(`Started up at port: ${port}`);
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