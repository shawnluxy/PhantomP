var express = require('express');
var cors = require('cors');
var bodyparser = require('body-parser');
var app = express();
var router = express.Router();
var port = 233;

// app.use(express.static(__dirname+'/'));
app.use(cors());
app.use(bodyparser.json());

app.listen(port, function(){
	console.log('PhantomP server listening ...');
});

app.get('/', function(req,res){
	res.send('Phantom Portrait');
});
