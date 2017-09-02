const router = require('express').Router();
const Photo = require('../model/photo').getPhotoModel();
const User = require('../model/user').getUserModel();
const fs = require('fs');
const multer = require('multer');

router.use(function (req, res, next) {
    next();
});

router.get('/', function (req, res) {
    res.send('portraits');
});

router.get('/find/:id', function (req, res) {
    var id = req.params.id;
    Photo.findOne({_id: id}, function (err, photo) {
        if(err){
            res.status(400).json({msg: err});
        } else if(photo===null){
            res.status(404).json({msg: 'EMPTY'});
        } else{
            res.status(200).json({msg: 'OK', res: photo});
        }
    });
});

router.post('/upload/:uid', function (req, res) {
    var uid = req.params.uid;
    User.findOne({_id: uid}, function (err, user) {
        if(err){
            res.status(400).json({msg: err});
        } else if(user===null){
            res.status(404).json({msg: 'EMPTY'});
        } else{
            var storage = multer.diskStorage({
                destination: '/var/www/html/PhantomP/upload/photo/'+uid,
                filename: function (req, file, cb) {
                    var time = new Date().toISOString().slice(-24).replace(/\D/g,'').slice(0, 14);
                    cb(null, file.originalname + '-' + time)
                }
            });
            var upload = multer({
                storage: storage,
                limits: { fileSize: 1000000 },
                fileFilter: function (req, file, cb) {
                    var ext = file.mimetype.split('/')[0];
                    if(ext!=='image'){
                        return cb(new Error('Not Image'), false);
                    }
                    cb(null, true);
                }
            }).array('photo', 9);
            upload(req, res, function (err) {
                if(err){
                    return res.status(400).json({msg: err});
                }
                var files = req.files;
                var storeFiles = function (files, cb) {
                    for(var i=0; i<files.length; i++)( function (i) {
                        fs.readFile(files[i].path, function (err, data) {
                            var photo = new Photo;
                            photo.userID = user._id;
                            photo.image = data;
                            photo.name = files[i].filename;
                            photo.contentType = files[i].mimetype;
                            photo.save(function (err, p) {
                                if(err){
                                    return cb(err);
                                } else {
                                    user.addPhoto(p._id, user._id, function (err) {
                                        if(err) return cb(err);
                                        cb(null);
                                    });
                                }
                            });
                        });
                    })(i);
                };
                storeFiles(files, function (err) {
                    if(err){
                        res.status(400).json({msg: err});
                    } else {
                        res.status(200).json({msg: 'SUCCESS'});
                    }
                });
            });
        }
    });
});

router.delete('/delete', function (req, res) {
    var pid = req.body.pid;
    Photo.findOneAndRemove({_id: pid}, function (err, photo) {
        if(err){
            res.status(400).json({msg: err});
        } else if(photo===null){
            res.status(404).json({msg: 'EMPTY'});
        } else{
            var uid = photo.userID;
            User.findOne({_id: uid}, function (err, user) {
                if(err){
                    return res.status(400).json({msg: err});
                } else if(user!==null){
                    user.removePhoto(pid, uid, function (err) {
                        if(err) return res.status(400).json({msg: err});
                    });
                }
                res.status(200).json({msg: 'DELETED', res: photo._id});
            });
        }
    });
});

module.exports = router;