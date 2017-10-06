var async           =   require('async');
var path            =   require('path');
var fse             =   require('fs-extra');
var lodash          =   require('lodash');
var Sequelize       =   require('sequelize');
var sensitive       =   require('../settings/sensitive-settings.json');
var acctTypes       =   require('../variables/accountTypes.json');
var models          =   {};
var sequelize = new Sequelize(sensitive.mySQL.database, sensitive.mySQL.username, sensitive.mySQL.password, {
    host: sensitive.mySQL.host, dialect: 'mysql', logging: false, pool: {max: 30, min: 0, idle: 10000}
});

//methods
async.waterfall([
    //authenticate
    function (callback) {
        sequelize.authenticate()
            .then(function () {callback();})
            .catch(callback);
    },
    //define models
    function (callback) {
        var modelsDirectory = path.join(process.cwd(), '/app/models');
        fse.readdirSync(modelsDirectory)
            .filter(function (file) {return (file.indexOf('.') !== 0);})
            .forEach(function (file) {
                var model = require(path.join(modelsDirectory, file));
                models[model.name] = model;
            });
        callback();
    },
    //sync database
    function (callback) {
        sequelize.sync(/*{force: true}*/)
            .then(function () {callback();})
            .catch(callback);
    },
    //ensure account types
    function (callback) {
        var types = [];
        for(var prop in acctTypes) types.push(lodash.extend(acctTypes[prop], {prop: prop}));
        async.each(types, function (type, cb) {
            models.UserType.findById(type.code)
                .then(function (acctType) {
                    if(!acctType) {
                        new models.UserType({
                            code: acctTypes[type.prop].code,
                            name: acctTypes[type.prop].name
                        }).save()
                            .then(function () {cb();})
                            .catch(cb);
                    } else cb();
                }).catch(cb);
        }, function (err) {
            callback(err);
        });
    },
    //ensure admin
    function (callback) {
        models.User.findAndCount({where: {type: 'ADMIN'}})
            .then(function (result) {
                if(result.count == 0) {
                    new models.User({
                        username: 'admin',
                        password: 'admin',
                        type: acctTypes.admin.code,
                        firstname: 'The',
                        middlename: 'Default',
                        lastname: 'Administrator'
                    }).save()
                        .then(function () {callback();})
                        .catch(callback);
                }
                else callback();
            })
            .catch(callback)
    }
], function (err) {
    if(err) throw err;
    else console.log('Database Synchronized.');
});

module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    models: models
};