var express             =   require('express');
var http                =   require('http');
var router              =   express.Router();



router.get('/', function (req, res) {
    res.render('pages/public/index');
});
router.get('/login', function (req, res) {
    if(res.locals.user) res.redirect('/' + res.locals.user.UserType.code.toLowerCase() + '/dashboard');
    else res.render('pages/public/login');
});
router.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});



module.exports = router;