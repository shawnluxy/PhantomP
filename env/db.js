const mongo = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/Phantom';

exports.setup = function () {
    var options = {
        // user: 'root',
        // pass: './root'
    };
    var db = mongo.createConnection(dbUrl, options);
    db.on('error', console.error.bind(console, 'connection error:'));
    db.on('disconnected', reconnect);
    return db;
};

function reconnect () {
    var option = {server: {socketOptions: {keepAlive: 1}}};
    return mongo.connect(dbUrl, option).connection;
}