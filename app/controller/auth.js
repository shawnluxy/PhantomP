const router = require('express').Router();
const mongo = require('mongoose');

router.use(function (req, res, next) {
    next();
});

router.get('/', function (req, res) {
    res.send('auth');
});

module.exports = router;