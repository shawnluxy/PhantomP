const router = require('express').Router();
const User = require('../model/user').getUserModel();
const bcrypt = require('bcrypt');
const nev = require('./emailv');


router.use(function (req, res, next) {
    next();
});

router.get('/', function (req, res) {
    res.send('users');
});

router.get('/find/:id', function (req, res) {
    var id = req.params.id;
    var fields = 'username nickname portrait photo';
    User.findOne({_id: id}, fields, function (err, user) {
        if(err){
            res.status(400).json({msg: err});
        } else if(user===null){
            res.status(404).json({msg: 'EMPTY'});
        } else{
            res.status(200).json({msg: 'OK', res: user});
        }
    });
});

router.post('/create', function (req, res) {
    var user = new User(req.body);
    nev.createUser(user, res);
});

router.get('/emailVerification/:URL', function (req, res) {
    var url = req.params.URL;
    nev.confirmUser(url, res);
});

router.post('/resendEmail', function (req, res) {
    var email = req.body.username;
    nev.resend(email, res);
});

router.post('/login', function (req, res) {
    var name = req.body.username;
    var pwd = req.body.password;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    User.findOne({username: name}, function (err, user) {
        if(err){
            res.status(400).json({msg: err});
        } else if(user === null){
            res.status(404).json({msg: 'USER NOT EXISTS'});
        } else {
            bcrypt.compare(pwd, user.password, function(err, result) {
                if(!result){
                    res.status(417).json({msg: 'PASSWORD INCORRECT'});
                } else {
                    user.addIP(ip, user._id, function (err) {
                        if(err) console.log(err);
                    });
                    res.status(200).json({msg: 'OK', res: user._id});
                }
            });
        }
    });
});

router.put('/update/:id', function (req, res) {
    var id = req.params.id;
    var updates = req.body;
    var userUpdate = function (uid, updates, res) {
        User.findOneAndUpdate({_id: uid}, updates, {new: true}, function (err, user) {
            if(err){
                res.status(400).json({msg: err});
            } else if(user===null){
                res.status(404).json({msg: 'EMPTY'});
            } else{
                res.status(200).json({msg: 'OK', res: user});
            }
        });
    };
    if(updates.hasOwnProperty('password')) {
        bcrypt.genSalt(12, function(err, salt) {
            bcrypt.hash(updates.password, salt, function(err, hash) {
                updates.password = hash;
                userUpdate(id, updates, res);
            });
        });
    } else {
        userUpdate(id, updates, res);
    }
});

router.delete('/delete', function (req, res) {
    var id = req.body.id;
    User.findOneAndRemove({_id: id}, function (err, user) {
        if(err){
            res.status(400).json({msg: err});
        } else if(user===null){
            res.status(404).json({msg: 'EMPTY'});
        } else{
            res.status(200).json({msg: 'DELETED', res: user._id});
        }
    });
});

module.exports = router;