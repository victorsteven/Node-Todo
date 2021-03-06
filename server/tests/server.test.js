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
            .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    })
})

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
        //we convert the _id object to string
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)

        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text)
        })
        .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        request(app)
        //we convert the _id object to string
        .get(`/todos/${todos[1]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)

        .expect(404)
        // .expect((res) => {
        //     expect(res.body.todo.text).toBe(todos[0].text)
        // })
        .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID();
        request(app)
        .get(`/todos/${id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 non-object ids', (done) => {
        request(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    })
}) 

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId)
        })
        .end((err, res) => {
            if(err){
                return done(err);
            }
            Todo.findById(hexId).then(todo => {
                expect(todo).toBeFalsy();
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not remove a todo a user dont own', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        // .expect((res) => {
        //     expect(res.body.todo._id).toBe(hexId)
        // })
        // .end(done)
        .end((err, res) => {
            if(err){
                return done(err);
            }
            Todo.findById(hexId).then(todo => {
                expect(todo).toBeTruthy();
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
        .set('x-auth', users[1].tokens[0].token)
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
        .set('x-auth', users[1].tokens[0].token)
        .send({text, completed})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(completed)
            // expect(res.body.todo.completedAt).toBeGreaterThan(2)
            expect(typeof res.body.todo.completedAt).toBe('number');
            
        })
        .end(done);
    })

    it('should not update a todo created by another user', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = "This is the new body"
        var completed = true
        request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({text, completed})
        .expect(404)
        .end(done);
    })

    it('Should clear completedAt when todo is not completed', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text ="THis is our update";
        var completed = false;
        request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({text, completed})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(completed);
            expect(res.body.todo.completedAt).toBeFalsy();
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
             expect(res.headers['x-auth']).toBeTruthy();
             expect(res.body._id).toBeTruthy();
             expect(res.body.email).toBe(email);
         })
        //  .end(done); 
        .end(err => {
            if(err){
                return done(err);
            }
            User.findOne({email}).then((user) => {
                expect(user).toBeTruthy();
                expect(user.password).not.toBe(password); //this should return false because the password dont match
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
             expect(res.headers['x-auth']).toBeTruthy();
         })
         .end((err, res) => {
             if(err){
                 return done(err);
             }
             User.findById(users[1]._id).then(user => {
                // expect(user.tokens[1]).toMatchObject({
                expect(user.toObject().tokens[1]).toMatchObject({
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
             expect(res.headers['x-auth']).toBeFalsy();
         })
         .end((err, res) => {
             if(err){
                 return done(err);
             }
             User.findById(users[1]._id).then(user => {
                 expect(user.tokens.length).toBe(1);
                 done();
             }).catch(e => done(e));
         });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        // var tok = users[0].tokens[1].token;
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        // .send({token: tok})
        .expect(200)
        .end((err, res) => {
            if(err){
                return done(err);
            }
            User.findById(users[0]._id).then(user => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch(e => done(e));
        });
    });
});



