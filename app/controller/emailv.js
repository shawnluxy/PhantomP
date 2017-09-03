const mongo = require('mongoose');
const nev = require('email-verification')(mongo);
const bcrypt = require('bcrypt');
const UserModel = require('../model/user').getUserModel();

// async hashing function
var Hasher = function(pwd, tempUserData, insertTempUser, callback) {
    bcrypt.genSalt(12, function(err, salt) {
        bcrypt.hash(pwd, salt, function(err, hash) {
            return insertTempUser(hash, tempUserData, callback);
        });
    });
};

nev.configure({
    verificationURL: 'http://shawnluxy.ddns.net:2333/user/emailVerification/${URL}',
    persistentUserModel: UserModel,
    emailFieldName: 'username',
    expirationTime: 3600,    // 60min

    transportOptions: {
        service: 'Gmail',
        auth: {
            user: 'luxyshawn@gmail.com',
            pass: 'luxinyi173932'
        }
    },
    hashingFunction: Hasher
}, function(err){
    if(err) return console.log(err);
});
nev.generateTempUserModel(UserModel, function(err) {
    if(err) return console.log(err);
});

exports.createUser = function (user, res) {
    nev.createTempUser(user, function(err, exists, newTempUser) {
        if (err) {
            return res.status(400).json({msg: err});
        }
        // user already exists in persistent collection
        if (exists) {
            return res.status(409).json({msg: 'You have already signed up and confirmed your account.'});
        }
        // new user created
        if (newTempUser) {
            var URL = newTempUser[nev.options.URLFieldName];
            nev.sendVerificationEmail(user.username, URL, function(err, info) {
                if (err) {
                    return res.status(400).json({msg: err});
                }
                res.status(200).json({
                    msg: 'A verification email has been sent to you. Please confirm it.',
                    res: info
                });
            });
        // user already exists in temporary collection
        } else {
            res.status(200).json({msg: 'You have already signed up. Please check your email.'});
        }
    });
};

exports.resend = function (email, res) {
    nev.resendVerificationEmail(email, function(err, userFound) {
        if (err) {
            return res.status(400).json({msg: err});
        }
        if (userFound) {
            res.status(200).json({msg: 'A verification email has been sent to you, yet again. Please check it.'});
        } else {
            res.status(200).json({msg: 'Your verification code has expired. Please sign up again.'});
        }
    });
};

exports.confirmUser = function (url, res) {
    nev.confirmTempUser(url, function(err, user) {
        if (err) {
            return res.status(400).send(err);
        }
        if (user) {
            // nev.sendConfirmationEmail(user.username, function(err) {
            //     if (err) {
            //         return res.status(400).send(err);
            //     }
                res.status(200).send('Your account has been successfully verified.');
            // });
        } else {
            return res.status(404).send('Error: Your account has already been verified.');
        }
    });
};
