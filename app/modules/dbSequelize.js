var promiseToCallback = require('promise-to-callback');
var async           =   require('async');
var sensitive       =   require('../settings/sensitive-settings.json');
var Sequelize       =   require('sequelize');
var sequelize = new Sequelize(sensitive.mySQL.database, sensitive.mySQL.username, sensitive.mySQL.password, {
    host: sensitive.mySQL.host,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 30,
        min: 0,
        idle: 10000
    }
});

module.exports = {
    sequelize: sequelize,
    Sequelize: Sequelize,
    initContents: function () {
        var createUserType = function (code, name) {
            var UserType = new sequelize.models.UserType();
            UserType.code = code;
            UserType.name = name;
            return UserType.save();
        };
        var createDefaultAdminAccount = function () {
            var User = new sequelize.models.User();
            User.username = 'admin';
            User.password = 'admin';
            User.type = 'ADMIN';
            User.firstname = 'The';
            User.middlename = 'Default';
            User.lastname = 'Administrator';
            return User.save().catch(function (err) {
                if(err) throw err;
            });
        };
        var checkUserTypes = function (cb) {
            sequelize.models.UserType.findAndCount().then(function (result) {
                var codes = result.rows.map(function (u) {return u.code});
                async.parallel([
                    function (callback) {
                        if(codes.indexOf('ADMIN') < 0)
                            promiseToCallback(createUserType('ADMIN', 'Administrator'))(callback);
                        else callback();
                    },
                    function (callback) {
                        if(codes.indexOf('BRGY') < 0)
                            promiseToCallback(createUserType('BRGY', 'Barangay'))(callback);
                        else callback();
                    },
                    function (callback) {
                        if(codes.indexOf('CSWD') < 0)
                            promiseToCallback(createUserType('CSWD', 'City Social Welfare and Development'))(callback);
                        else callback();
                    },
                    function (callback) {
                        if(codes.indexOf('CDRRMO') < 0)
                            promiseToCallback(createUserType('CDRRMO', 'City Disaster Risk Reduction Management Office'))(callback);
                        else callback();
                    }
                ], function (err) {
                    if(err) cb(err);
                    else cb();
                });
            }).catch(function (err) {cb(err);});
        };
        var checkAccounts = function () {
            promiseToCallback(sequelize.models.User.findAndCount({
                where: {type: 'ADMIN'}
            }))(function (err, result) {
                if(err) throw err;
                else if(result.count <= 0) createDefaultAdminAccount();
            });
        };
        checkUserTypes(function (err) {
            if(err) throw err;
            else checkAccounts();
        });
    }
};