const mongo = require('mongoose');
const schema = mongo.Schema;
var ObjectId = schema.Types.ObjectId;

var userSchema = new schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    active: {type: Boolean, default: false},
    ip_address: [String],
    nickname: {type: String, default: ''},
    portrait: ObjectId,
    photo: [String]
});

// validation
userSchema.path('username').validate(function (email) {
    return email.length;
}, 'Empty username');
userSchema.path('username').validate(function (email, fn) {
    User.find({username: email}, function (err, list) {
        if(err) return console.error('{username/validate} '+err);
        if(list.length>0) fn(false);
        else fn(true);
    });
}, 'Email exists');
userSchema.path('password').validate(function (pwd) {
    return pwd.length>=6;
}, 'Password too short');
userSchema.path('nickname').validate(function (name) {
    return name.length;
}, 'Empty nickname');

//methods
userSchema.methods = {
    checkPwd: function (pwd) {
        return pwd === this.password;
    },
    addIP: function (ip, uid) {
        var ips = this.ip_address;
        if(ips.indexOf(ip)<0){
            ips.push(ip);
            User.update({_id: uid}, {ip_address: ips}, function (err) {
                return err;
            });
        }
    },
    addPhoto: function (pid, uid) {
        var p = this.photo;
        if(p.indexOf(pid)<0){
            p.push(pid);
            User.update({_id: uid}, {photo: p}, function (err) {
                return err;
            });
        }
    },
    removePhoto: function (pid, uid) {
        var p = this.photo;
        if(p.indexOf(pid)>-1){
            p.splice(p.indexOf(pid), 1);
            User.update({_id: uid}, {photo: p}, function (err) {
                return err;
            });
        }
    }
};

var User = mongo.model('User', userSchema, 'user');
exports.getUserModel = function () {
    return User;
};