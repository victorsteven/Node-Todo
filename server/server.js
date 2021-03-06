require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/Todo');
var {User} = require('./models/User');
var {authenticate} = require('./middleware/authenticate');



var app = express();
const port = process.env.PORT || 3000;

//with the code below, we can send json data to our express app
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    // console.log(req.body);
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });
    todo.save().then((doc) => {
        res.send(doc); //send this to the user
    }, err => res.status(400).send(err));
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        // res.send(todos) // if we want to pass the array back
        res.send({todos}) //we are passing the object

    }, e => res.status(400).send(e));
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        // return console.log('ID is not valid')
        return res.status(404).send();
    }
    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo})
    }).catch(e => res.status(400).send())
})

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo})
    }).catch(e => res.status(400).send())
})

app.patch('/todos/:id', authenticate, (req, res) => {
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
    Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch(e => {
        res.status(400).send();
    }); 
});


//POST users
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body) //dont pass the body as an object. is already an object
    user.save().then(() => {
        return user.generateAuthToken();
        // res.send(result)
    }).then((token) => {
        //the code below reads: set this
        res.header('x-auth', token).send(user); //we send back as a http responds header
    })
    .catch((e) => {
        res.status(400).send(e);
    });
});

//POST /users/login {email, password}
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    // res.send(body)

    User.findByCredentials(body.email, body.password).then(user => {
            return user.generateAuthToken().then(token => {
                res.header('x-auth', token).send(user);
        });
        // res.send(user);
    }).catch(e => {
        res.status(400).send();
    })

})



app.get('/users/me', authenticate, (req, res) => {
    // //get the header
    // var token = req.header('x-auth');
    // User.findByToken(token).then((user) => {
    //     if(!user){
    //         return Promise.reject();
    //     }
    //     res.send(user);
    // }).catch((e) => {
    //     res.status(401).send();
    // });
    res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) => {
    //calling an instance method below
    req.user.removeToken(req.token).then(() => { //we are not expecting anything back
        res.status(200).send();
    }, () => {
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