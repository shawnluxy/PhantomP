const router = require('express').Router();
const Photo = require('../model/photo').getPhotoModel();
const User = require('../model/user').getUserModel();
const fs = require('fs');
const multer = require('multer');

router.use(function (req, res, next) {
    next();
});

router.get('/', function (req, res) {
    res.send('portrait');
});

router.get('/find/:id', function (req, res) {
    var id = req.params.id;
    Photo.findOne({_id: id}, function (err, photo) {
        if(err){
            res.send('FAIL:'+err);
        } else if(photo===null){
            res.send('EMPTY');
        } else{
            res.send(photo);
        }
    });
});

router.post('/upload/:uid', function (req, res) {
    var uid = req.params.uid;
    User.findOne({_id: uid}, function (err, user) {
        if(err){
            res.send('FAIL:'+err);
        } else if(user===null){
            res.send('EMPTY');
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
                    return res.send('FAIL:'+err);
                }
                var files = req.files;
                for(var i=0; i<files.length; i++){
                    var photo = new Photo;
                    photo.userID = user._id;
                    photo.image = fs.readFileSync(files[i].path);
                    photo.name = files[i].filename;
                    photo.contentType = files[i].mimetype;
                    photo.save(function (err, p) {
                        if(err){
                            return res.send('FAIL:'+err);
                        } else {
                            var error = user.addPhoto(p._id, user._id);
                            if(error) return res.send('FAIL:'+error);
                        }
                    });
                }
                res.send('SUCCESS');
            });
        }
    });
});

router.delete('/delete', function (req, res) {
    var pid = req.body.pid;
    Photo.findOneAndRemove({_id: pid}, function (err, photo) {
        if(err){
            res.send('FAIL:'+err);
        } else if(photo===null){
            res.send('EMPTY');
        } else{
            var uid = photo.userID;
            User.findOne({_id: uid}, function (err, user) {
                if(err){
                    return res.send('FAIL:'+err);
                } else if(user!==null){
                    var error = user.removePhoto(pid, uid);
                    if(error) return res.send('FAIL:'+error);
                }
                res.send('DELETED: ' + photo._id);
            });
        }
    });
});

module.exports = router;