//constants
var express             =   require('express');
var session             =   require('express-session');
var bodyParser          =   require('body-parser');
var favicon             =   require('serve-favicon');
var morgan              =   require('morgan');
var rfs                 =   require('rotating-file-stream');
var sequelize           =   require('sequelize');
var path                =   require('path');
var fse                 =   require('fs-extra');
var db                  =   require('./app/modules/dbSequelize');

//variables
var senSettings = require('./app/settings/sensitive-settings.json');
var appSettings = require('./app/settings/application-settings.json');
var port = appSettings.port;
var app = express();

//set
app.set('view engine', 'ejs');

//middleware
app.use(morgan('combined', {stream: rfs('access.log', {interval: '1d', path: path.join(__dirname, '.logs')})}));
app.use(favicon(__dirname + '/public/assets/img/logo/logo-100px.png'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: senSettings.secretKey,
    name: 'cdrrmoapp.sid',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: 'auto', maxAge: 86400000} //1 day
}));

//set res locals
app.use(function (req, res, next) {
    res.locals.appSettings = appSettings;
    db.models.User.findOne({
        attributes: { exclude: ['password', 'enabled', 'type', 'barangay', 'createdAt', 'updatedAt']},
        where: {
            username: req.session.username,
            enabled: true
        },
        include: [
            { model: db.models.UserType, attributes: { exclude: ['createdAt', 'updatedAt']} },
            {
                model: db.models.Barangay,
                attributes: { exclude: ['district', 'createdAt', 'updatedAt']},
                include: [
                    {
                        model: db.models.District,
                        attributes: { exclude: ['city', 'createdAt', 'updatedAt']},
                        include: [
                            {
                                model: db.models.City,
                                attributes: { exclude: ['createdAt', 'updatedAt']}
                            }
                        ]
                    }
                ]
            }
        ]
    }).then(function (user) {
        res.locals.user = user;
    }).catch(function () {
        res.locals.user = undefined;
    }).finally(function () {
        next();
    });
});

//routes
app.use('/', require('./app/routes/public'));
app.use('/api', require('./app/routes/api'));
app.use('/admin', require('./app/routes/admin'));

//page not found
app.use(function (req, res) {
    res.render('pages/public/page-not-found');
});

//error handler
app.use(function (err, req, res, next) {
    var message = (err.constructor == String)? err:(err.message || 'Unable to execute a code in server.');
    res.render('pages/public/page-error', {
        errorMessage: message
    });
});

//start sever
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server Running @ ' + host + ':' + port);
});