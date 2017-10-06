var express             =   require('express');
var router              =   express.Router();


router.use(function (req, res, next) {
    if((!res.locals.user) || (res.locals.user.UserType.code != 'ADMIN')) throw 'Unauthorized Access. Only administrator account can access this page.';
    else next();
});

router.get('/dashboard', function (req, res) {
    res.render('pages/admin/dashboard');
});

router.get('/manage-places', function (req, res) {
    res.render('pages/admin/manage-places');
});

module.exports = router;