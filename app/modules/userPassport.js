var async = require('async');
var promiseToCallback = require('promise-to-callback');
var db = require('../models');

module.exports = {
    validateByUsername: function (username, callback) {
        promiseToCallback(db.models.User.findOne({
            where: {username: username}
        }))(function (err, user) {
           if(err) callback(err.message || 'Authorization failed. Cannot validate username.');
           else if(!user) callback('Authorization failed. Username does not exist.');
           else if(!user.enabled) callback('Authorization failed. Username was disabled.');
           else callback(null, user);
        });
    }
};