const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/Todo');
const {User} = require('./../models/User');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


//lets clear our database first
// beforeEach((done) => {
//     Todo.remove({}).then(() => done())
// });
beforeEach(populateUsers);
beforeEach(populateTodos);

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
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
          .get('/users/me')
          .set('x-auth', users[0].tokens[0].token)
          .expect(200)
          .expect(res => {
              //the id the comes back in the body should be the id of the user whose token we supplied
              expect(res.body._id).toBe(users[0]._id.toHexString());
              expect(res.body.email).toBe(users[0].email);
          })
          .end(done);
    })
    it('should return 401 if not authenticated', (done) => {
        request(app)
          .get('/users/me')
          .expect(401)
          .expect(res => {
              expect(res.body).toEqual({})
          })
          .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = '123mb!';

        request(app)
         .post('/users')
         .send({email, password})
         .expect(200)
         .expect(res => {
             expect(res.headers['x-auth']).toBeDefined();
             expect(res.body._id).toBeDefined();
             expect(res.body.email).toBe(email);
         })
        //  .end(done); 
        .end(err => {
            if(err){
                return done(err);
            }
            User.findOne({email}).then((user) => {
                expect(user).toBeDefined();
                // expect(user.password).toBe(password); //this should return false because the password dont match
                done();
            }).catch(e => done(e));
        });
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'exampleexample.com';
        var password = '123mb!';
        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });

    it('It should not create user if email in use', (done) => {
        var email = users[0].email;
        var password = 123445;
        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    })
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
         .post('/users/login')
         .send({
             email: users[1].email,
             password: users[1].password
         })
         .expect(200)
         .expect(res => {
             expect(res.headers['x-auth']).toBeDefined();
         })
         .end((err, res) => {
             if(err){
                 return done(err);
             }
             User.findById(users[1]._id).then(user => {
                expect(user.tokens[0]).toMatchObject({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
                done();
             }).catch(e => done(e));
         });
    });

    it('should reject invalid login', (done) => {
        request(app)
         .post('/users/login')
         .send({
             email: users[1].email,
             password: 'jnhvjvkfjr'
         })
         .expect(400)
         .expect(res => {
             expect(res.headers['x-auth']).toBeUndefined();
         })
         .end((err, res) => {
             if(err){
                 return done(err);
             }
             User.findById(users[1]._id).then(user => {
                 expect(user.tokens.length).toBe(0);
                 done();
             }).catch(e => done(e));
         });
    });
});


