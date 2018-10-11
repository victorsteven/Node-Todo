const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/Todo');
const {User} = require('./../../models/User');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
    {
        _id: userOneId,
        email: 'victor@gmail.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()  
        }]
    }, 
    {
        _id: userTwoId,
        email: 'jen@gmail.com',
        password: 'userTwoPass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()  
        }]
    }
];

//setting up dummy todos:
const todos = [
    {
        _id: new ObjectID(),
        text: 'First test todo',
        _creator: userOneId
    },
    {
        _id: new ObjectID,
        text: 'Second test todo',
        completed: true,
        completedAt: 333,
        _creator: userTwoId
    }
];

const populateTodos = (done) => {
    //remove all the Todos first before adding another
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save(); //this returns a promise
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
    }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};