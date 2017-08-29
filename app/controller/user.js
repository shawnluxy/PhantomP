const router = require('express').Router();
const User = require('../model/user').getUserModel();

router.use(function (req, res, next) {
    next();
});

router.get('/', function (req, res) {
    res.send('users');
});

router.get('/find/:id', function (req, res) {
    var id = req.params.id;
    var fields = 'username nickname active portrait photo';
    User.findOne({_id: id}, fields, function (err, user) {
        if(err){
            res.send('FAIL:'+err);
        } else if(user===null){
            res.send('EMPTY');
        } else{
            res.send(user);
        }
    });
});

router.post('/create', function (req, res) {
    var user = new User(req.body);
    user.save(function (err, u) {
        if(err){
            res.send('FAIL:'+err);
        } else {
            res.send(u._id);
        }
    });
});

router.post('/login', function (req, res) {
    var name = req.body.username;
    var pwd = req.body.password;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    User.findOne({username: name}, function (err, user) {
        if(err){
            res.send('FAIL:'+err);
        } else if(user === null){
            res.send('USER NOT EXISTS');
        } else if(!user.checkPwd(pwd)){
            res.send('PASSWORD INCORRECT');
        } else if(!user.active){
            res.send('INACTIVE');
        } else{
            user.addIP(ip, user._id);
            res.send(user._id);
        }
    });
});

router.put('/update/:id', function (req, res) {
    var id = req.params.id;
    var updates = req.body;
    User.findOneAndUpdate({_id: id}, updates, {new: true}, function (err, user) {
        if(err){
            res.send('FAIL:'+err);
        } else if(user===null){
            res.send('EMPTY');
        } else{
            res.send(user);
        }
    });
});

router.delete('/delete', function (req, res) {
    var id = req.body.id;
    User.findOneAndRemove({_id: id}, function (err, user) {
        if(err){
            res.send('FAIL:'+err);
        } else if(user===null){
            res.send('EMPTY');
        } else{
            res.send('DELETED: ' + user._id);
        }
    });
});

module.exports = router;