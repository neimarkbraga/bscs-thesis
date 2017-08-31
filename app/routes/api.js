var promiseToCallback   =   require('promise-to-callback');
var async               =   require('async');
var express             =   require('express');
var router              =   express.Router();
var userPassport        =   require('../modules/userPassport');
var db                  =   require('../models');

//===============================================
//      TABLE OF CONTENTS
//===============================================
/*

    1. User
        -me
        -register
        -authenticate
    2. ...
*/





//===============================================
//  1. User
//===============================================

router.post('/user/register', function (req, res) {
    async.waterfall([
        
        //check session & fields
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else if(!req.body.username) callback('username is required.');
            else if(!req.body.password) callback('password is required.');
            else if(!req.body.type) callback('type is required.');
            else if(!req.body.firstname) callback('firstname is required.');
            else if(!req.body.middlename) callback('middlename is required.');
            else if(!req.body.lastname) callback('lastname is required.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(user.type != 'ADMIN') callback('You are unauthorized Access to execute this action.');
                else callback();
            });
        },

        //check if username exists
        function (callback) {
            promiseToCallback(db.models.User.findOne({
                where: {username: req.body.username}
            }))(function (err, user) {
                if(err) callback(err.message || 'Error connection with database.');
                else if(user) callback('Username already exist');
                else callback();
            });
        },


        function (callback) {
            //save details
            var user = new db.models.User();
             user.username = req.body.username;
             user.password = req.body.password;
             user.type = req.body.type;
             user.firstname = req.body.firstname;
             user.middlename = req.body.middlename;
             user.lastname = req.body.lastname;
             if(req.body.barangay) user.barangay = req.body.barangay;
             promiseToCallback(user.save())(function (err, user) {
                 if(err) callback(err.message || 'Error saving user details');
                 else callback(null, user);
             });
        }
    ], function (err, result) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'User registered.'});
    });
});
router.post('/user/authenticate', function (req, res) {
    async.waterfall([
        
        //check fields
        function (callback) {
            if(!req.body.username) callback('username is required.');
            else if(!req.body.password) callback('password is required.');
            else callback();
        },
        
        //get data
        function (callback) {
            promiseToCallback(db.models.User.findOne({
                where: {username: req.body.username}
            }))(function (err, user) {
                if(err) callback(err.message || 'Error retrieving data.');
                else callback(null, user);
            });
        },

        //check
        function (user, callback) {
            if(!user) callback('Username does not exist.');
            else if(!user.enabled) callback('Username was disabled.');
            else if(user.comparePassword(req.body.password)) callback(null, user);
            else callback('Wrong password.');
        }
        
    ], function (err, result) {
        if(err) res.send({success: false, message: err});
        else {
            var user = result.get({raw: true});
            delete user.password;
            delete user.enabled;
            delete user.createdAt;
            delete user.updatedAt;
            req.session.username = user.username;
            res.send({success: true, message: 'authenticated', user: user});
        }
    });
});
router.get('/user/me', function (req, res) {
    userPassport.validateByUsername(req.session.username, function (err, user) {
        if(err) res.json({success: false, message: err});
        else {
            user = user.get({raw: true});
            if(!user.barangay) delete user.barangay;
            delete user.password;
            delete user.enabled;
            delete user.createdAt;
            delete user.updatedAt;
            res.json({success: true, user: user});
        }
    });
});
router.get('/user/logout', function (req, res) {
    req.session.destroy();
    res.json({success: true});
});
router.put('/user/change-password', function (req, res) {
    async.waterfall([

        //check fields
        function (callback) {
            if(!req.session.username) callback('Unauthorized Access.');
            else if(!req.body.old_password) callback('old_password is required.');
            else if(!req.body.new_password) callback('new_password is required.');
            else if(req.body.new_password.length < 6) callback('new_password password must be at least 6 characters.');
            else callback();
        },

        //validate account
        function (callback) {
            userPassport.validateByUsername(req.session.username, function (err, user) {
                if(err) callback(err);
                else if(!user.comparePassword(req.body.old_password)) callback ('Wrong old password.');
                else callback(null, user);
            });
        },

        //save password
        function (user, callback) {
            user.password = user.bcryptPassword(req.body.new_password);
            promiseToCallback(user.save())(function (err, user) {
                if(err) callback(err.message || 'Error updating password');
                else callback();
            });
        }
    ], function (err) {
        if(err) res.send({success: false, message: err});
        else res.send({success: true, message: 'Password updated.'});
    });
});


//===============================================
//  2. ...
//===============================================








module.exports = router;