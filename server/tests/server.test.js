const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/Todo');

//setting up dummy todos:
const todos = [
    {
        _id: new ObjectID(),
        text: 'First test todo'
    },
    {
        _id: new ObjectID,
        text: 'Second test todo',
        completed: true,
        completedAt: 333
    }
];
//lets clear our database first
// beforeEach((done) => {
//     Todo.remove({}).then(() => done())
// });
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        //using supertest:
        request(app)
            .post('/todos')
            .send({text}) //using ES6
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err){
                    return done(err); //return halts the execution of the script
                }
                Todo.find({text: 'Test todo text'}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            })

    });

    it('Should not create todo with invalid body data', (done) => {
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if(err){
                return done(err);
            }
            Todo.find().then((todos) => {
                expect(todos.length).toBe(2)
                done();
            }).catch((e) => done(e));
        });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    })
})

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
        //we convert the _id object to string
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text)
        })
        .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID();
        request(app)
        .get(`/todos/${id.toHexString()}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 non-object ids', (done) => {
        request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    })
}) 

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId)
        })
        .end((err, res) => {
            if(err){
                return done(err);
            }
            Todo.findById(hexId).then(todo => {
                expect(todo).toBeNull();
                done();
            }).catch((e) => done(e));
        });
    });

    it('should return 405 if todo not found', (done) => {
        var id = new ObjectID();
        request(app)
        .delete(`todos/${id.toHexString()}`)
        .expect(405)
        .end(done);
    });

    it('should return 404 non-object ids', (done) => {
        request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done);
    });
});

describe('PATCH todos/:id', () => {
    it('should update a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        var text = "This is the new body"
        var completed = true
        request(app)
        .patch(`/todos/${hexId}`)
        .send({text, completed})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(completed)
            expect(res.body.todo.completedAt).toBeGreaterThan(2)
            
        })
        .end(done);
    })

    it('Should clear completedAt when todo is not completed', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text ="THis is our update";
        var completed = false;
        request(app)
        .patch(`/todos/${hexId}`)
        .send({text, completed})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(completed);
            expect(res.body.todo.completedAt).toBeNull();
        })
        .end(done);
    })
})

