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
var db                  =   require('./app/models');

//variables
var app = express();
var port = process.env.PORT || '80';
var sensitive = require('./app/settings/sensitive-settings.json');
var appSettings = require('./app/settings/application-settings.json');
var sessionOption = {
    secret: sensitive.secretKey,
    name: 'cdrrmoapp.sid',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: 'auto',
        maxAge: 86400000 //1 day
    }
};

//ensure
fse.ensureDirSync('.logs');
fse.ensureDirSync('public');

//ensure database
db.sequelize
    .sync(/*{force: true}*/)
    .then(function () {
        console.log('Database status: OK');
        db.initContents();
    })
    .catch(function (err) {throw err;});

//set
app.set('view engine', 'ejs');

//middleware
app.use(morgan('combined', {stream: rfs('access.log', {interval: '1d', path: path.join(__dirname, '.logs')})}));
app.use(favicon(__dirname + '/public/assets/img/logo/logo-100px.png'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session(sessionOption));
app.use(function (req, res, next) {
    res.locals.appSettings = appSettings;
    next();
});
app.use(function (req, res, next) {
    db.models.User.findAll({
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
    }).then(function (users) {
        if(users.length > 0) res.locals.user = users[0];
        else res.locals.user = undefined;
    }).catch(function () {
        res.locals.user = undefined;
    }).finally(function () {
        next();
    });
});

//routes
app.use('/api', require('./app/routes/api'));
app.use('/', require('./app/routes/public'));

//page not found
app.use(function (req, res) {
    res.render('pages/public/page-not-found');
});

//error handler
app.use(function (err, req, res) {
    res.send(err);
});

//start sever
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server status: RUNNING @ ' + host + ':' + port);
});