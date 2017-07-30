const mongo = require('mongoose');
const schema = mongo.Schema;
var ObjectId = schema.Types.ObjectId;

var photoSchema = new schema({
    userID: {type: ObjectId, required: true},
    image: Buffer,
    time: {type: Date, default: Date.now},
    contentType: {type: String, required: true}
});

//methods
photoSchema.methods = {

};

var Photo = mongo.model('Photo', photoSchema);
exports.getPhotoModel = function () {
    return Photo;
};