const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const sanitize = require('express-mongo-sanitize');
var logger = require('./env/logger');
var db = require('./env/db');

var app = express();
var port = 2333;

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(sanitize());
app.use(logger.logging());

db.setup().once('open', listen);

function listen () {
    app.listen(port, function () {
        console.log('PhantomP server listening ...');
    });
}

app.get('/', function(req,res){
	res.send('Phantom Portrait');
});

app.use('/user', require('./app/controller/user'));
app.use('/photo', require('./app/controller/photo'));
