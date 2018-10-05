const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minLength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

//passing the instance method: 'toJSON' to a regular function
//this method makes sure that what get returned that the user can view are just id and email
UserSchema.methods.toJSON = function(){
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
}


//passing the instance method: 'generateAuthToken' to a regular function
//this method adds a token to the individual user object
UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    //we call toString() because the result is an object below
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

//creating a model method:
UserSchema.statics.findByToken  = function(token){
    var User = this;
    var decoded; //an undefined variable
    try {
        decoded = jwt.verify(token, 'abc123');
    }catch(e){
        // return new Promise((resolve, reject) => {
        //     reject();
        // });
        return Promise.reject();
    }
    //this will return a promise, so we can attach 'then' on the findByToken function in server.js
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token, //accessing nested property
        'tokens.access': 'auth'
    })
}

var User = mongoose.model('User', UserSchema);

module.exports = {User}


//instance method get called with the individual documents
//Model method get called with the model as the 'this' binding
