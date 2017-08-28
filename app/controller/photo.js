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
            return console.error('{photo/find} '+err);
        }
        if(photo===null){
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
            return console.error('{photo/upload|find} '+err);
        }
        if(user===null){
            res.send('EMPTY');
        } else{
            var storage = multer.diskStorage({
                destination: '/var/www/html/PhantomP/upload/photo/'+uid,
                filename: function (req, file, cb) {
                    var time = new Date().toISOString().slice(-24).replace(/\D/g,'').slice(0, 14);
                    cb(null, file.originalname + '-' + time)
                }
            });
            var upload = multer({ storage: storage, limits: { fileSize: 1000000 } }).array('photo', 9);
            upload(req, res, function (err) {
                if(err){
                    res.send('FAIL:'+err);
                    return console.error('{photo/upload} '+err);
                }
                var files = req.files;
                for(var i=0; i<files.length; i++){
                    var photo = new Photo;
                    photo.userID = user._id;
                    photo.image = fs.readFileSync(files[i].path);
                    photo.contentType = files[i].mimetype;
                    photo.save(function (err, p) {
                        if(err){
                            res.send('FAIL:'+err);
                            return console.error('{photo/upload|save} '+err);
                        } else {
                            user.addPhoto(p._id, user._id);
                        }
                    });
                }
                res.send('SUCCESS');
            });
        }
    });
});

module.exports = router;