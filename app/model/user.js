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
    photo: [ObjectId]
});

// validation
userSchema.path('username').validate(function (email) {
    return email.length;
}, 'Empty username');
userSchema.path('username').validate(function (email, fn) {
    var User = mongo.model('User', userSchema, 'user');
    User.find({username: email}, function (err, list) {
        if(err) return console.error(err);
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
    addIP: function (ip) {
        if(this.ip_address.indexOf(ip)<0){
            this.ip_address.push(ip);
            return true;
        }
    },
    addPhoto: function (id) {
        if(this.photo.indexOf(id)<0){
            this.photo.push(id);
            return true;
        }
    }
};

var User = mongo.model('User', userSchema, 'user');
exports.getUserModel = function () {
    return User;
};