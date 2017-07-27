const router = require('express').Router();


router.use(function (req, res, next) {
    next();
});

router.get('/', function (req, res) {
    res.send('users');
});

module.exports = router;