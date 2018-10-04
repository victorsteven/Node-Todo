const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/Todo');

//lets clear our database first
beforeEach((done) => {
    Todo.remove({}).then(() => done())
})

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
                Todo.find().then((todos) => {
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
                expect(todos.length).toBe(0)
                done();
            }).catch((e) => done(e));
        })
    })
});