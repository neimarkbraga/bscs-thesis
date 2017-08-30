//constants
var express             =   require('express');
var session             =   require('express-session');
var bodyParser          =   require('body-parser');
var favicon             =   require('serve-favicon');
var passport            =   require('passport');
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
    .sync({
        //alter: true,
        force: true //DELETE THIS ON DEPLOYMENT
    })
    .then(function () {
        console.log('Database status: OK');
    })
    .catch(function (err) {
        throw err;
    });

//middleware
app.use(morgan('combined', {stream: rfs('access.log', {interval: '1d', path: path.join(__dirname, '.logs')})}));
app.use(favicon(__dirname + '/public/assets/img/logo/logo-100px.png'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.appSettings = appSettings;
    next();
});

//routes
app.use('/api', require('./app/routes/api'));
app.use('/', function (req, res) {
    res.send('Hello World!');
});

//error handler
app.use(function (err, req, res, next) {
    res.send(err);
});

//start sever
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server status: RUNNING @ ' + host + ':' + port);
});