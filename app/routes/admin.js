var express             =   require('express');
var router              =   express.Router();

router.get('/dashboard', function (req, res) {
    res.render('pages/admin/dashboard');
});

module.exports = router;