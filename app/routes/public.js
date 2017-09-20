var express             =   require('express');
var router              =   express.Router();



router.get('/', function (req, res) {
    res.render('pages/public/index');
});

router.get('/login', function (req, res) {
    res.render('pages/public/login');
});

module.exports = router;