const mongo = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/Phantom';

exports.setup = function () {
    mongo.Promise = global.Promise;
    var db = connect();
    db.on('error', console.error.bind(console, 'connection error:'));
    db.on('disconnected', connect);
    // console.log(mongo.connection.readyState);
    return db;
};

function connect () {
    var option = {
        // user: 'root',
        // pass: './root'
        server: {socketOptions: {keepAlive: 1}}
    };
    return mongo.connect(dbUrl, option).connection;
}