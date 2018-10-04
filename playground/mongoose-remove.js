const {ObjectID} = require('mongodb');

const {mongoose} = require("./../server/db/mongoose");
const {Todo} = require('./../server/models/Todo');
const {User} = require('./../server/models/User');

// Todo.remove({}).then((result) => {
//     console.log(result)
// });

var newTodo = new Todo({
    text: 'This is me'
});
newTodo.save().then(result => console.log('user saved successfully')).catch(e => console.log(e));


// Todo.findOneAndRemove('5bb687aef0c42f45f6454661').then(todo => console.log(todo));

// Todo.findOneAndRemove({_id: '5bb6888d1f680547906646a4'}).then(todo => console.log(todo));

