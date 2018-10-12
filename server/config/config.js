var env = process.env.NODE_ENV || 'development';
console.log('env *******', env);

if(env === "development" || env === "test"){
    var config = require('./config.json');
    // console.log(config);

    //to use a variable to access a property we use bracket notation
    var envConfig = config[env];

    //Object.keys take all object keys and return them as an array
    // console.log(Object.keys(envConfig));
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });

}
  
// if(env === 'development'){
//     process.env.PORT = 3000;
//     //MONGODB_URI is gotten from Heroku plugin
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
// }else if(env === 'test'){
//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
// }