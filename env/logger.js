var morgan = require('morgan');
var fs = require('fs');
var path = require('path');

var accessLogStream = fs.createWriteStream(path.join(__dirname, '../server.log'), {flags: 'a'});

morgan.token('mydate', function () {
    var format = function(num) {
        var str = String(num);
        return (str.length === 1 ? '0' : '') + str;
    };
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dateTime = new Date();
    var date = dateTime.getDate();
    var hour = dateTime.getHours();
    var mins = dateTime.getMinutes();
    var secs = dateTime.getSeconds();
    var year = dateTime.getFullYear();
    var timezoneoffset = dateTime.getTimezoneOffset();
    var sign = timezoneoffset > 0 ? '-' : '+';
    timezoneoffset = parseInt(Math.abs(timezoneoffset)/60);
    var month = months[dateTime.getUTCMonth()];
    return format(date) + '/' + month + '/' + year + ':' +
        format(hour) + ':' + format(mins) + ':' + format(secs) +
        ' ' + sign + format(timezoneoffset) + '00';
});

exports.logging = function () {
    return morgan(':remote-addr - :remote-user [:mydate] ":method :url HTTP/:http-version" ' +
        ':status :res[content-length]', {stream: accessLogStream});
};
